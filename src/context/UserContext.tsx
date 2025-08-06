
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, writeBatch, deleteDoc, setDoc, addDoc, getDocs, query, Unsubscribe, serverTimestamp, orderBy, Timestamp, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Video, Technology, Creator } from '@/types';

interface BulkDataItem {
    technology: string;
    creator: string;
    videoTitle: string;
    duration: string;
    url: string;
    creationDate?: Date;
}

interface UserContextType {
  user: User | null;
  isAdmin: boolean;
  technologies: Technology[];
  loading: boolean;
  signInWithGoogle: () => void;
  logout: () => void;
  updateVideoStatus: (videoId: string, status: Video['status']) => Promise<void>;
  addTechnology: (tech: Omit<Technology, 'id' | 'creators'>) => Promise<string>;
  addCreator: (techId: string, creator: { name: string; }) => Promise<string>;
  addVideo: (techId: string, creatorId: string, video: Omit<Video, 'id' | 'status'> & { createdAt?: Timestamp }) => Promise<void>;
  deleteTechnology: (techId: string) => Promise<void>;
  deleteCreator: (techId: string, creatorId: string) => Promise<void>;
  deleteVideo: (techId: string, creatorId: string, videoId: string) => Promise<void>;
  addBulkData: (data: BulkDataItem[], onProgress: (progress: number) => void) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStatuses, setUserStatuses] = useState<Record<string, Video['status']>>({});

  useEffect(() => {
    setLoading(true);
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        setIsAdmin(!!(adminEmail && currentUser.email === adminEmail));
      } else {
        setIsAdmin(false);
      }
      setLoading(false);
    });
    return () => authUnsubscribe();
  }, []);

  const memoizedSetTechnologies = useCallback((newTechnologies: Technology[]) => {
    setTechnologies(newTechnologies);
  }, []);

  useEffect(() => {
    if (!user) {
      setTechnologies([]);
      setUserStatuses({});
      setLoading(false);
      return;
    }

    setLoading(true);
    const statusesRef = collection(db, `users/${user.uid}/videoStatuses`);
    const statusesUnsubscribe = onSnapshot(statusesRef, (snapshot) => {
      const newStatuses: Record<string, Video['status']> = {};
      snapshot.docs.forEach(doc => {
        newStatuses[doc.id] = doc.data().status;
      });
      setUserStatuses(newStatuses);
    });

    const techQuery = query(collection(db, 'technologies'));
    const techUnsubscribe = onSnapshot(techQuery, (techSnapshot) => {
      const promises = techSnapshot.docs.map(async (techDoc) => {
        const techData = { id: techDoc.id, ...techDoc.data() } as Omit<Technology, 'creators'>;
        const creatorsSnapshot = await getDocs(query(collection(db, `technologies/${techDoc.id}/creators`)));
        const creators = await Promise.all(creatorsSnapshot.docs.map(async (creatorDoc) => {
          const creatorData = { id: creatorDoc.id, ...creatorDoc.data() } as Omit<Creator, 'videos'>;
          const videosSnapshot = await getDocs(query(collection(db, `technologies/${techDoc.id}/creators/${creatorDoc.id}/videos`), orderBy("createdAt", "asc")));
          const videos = videosSnapshot.docs.map(videoDoc => ({
            id: videoDoc.id,
            ...videoDoc.data(),
          } as Video));
          return { ...creatorData, videos };
        }));
        return { ...techData, creators };
      });

      Promise.all(promises).then(newTechnologies => {
        memoizedSetTechnologies(newTechnologies);
        setLoading(false);
      });
    });

    return () => {
      statusesUnsubscribe();
      techUnsubscribe();
    };
  }, [user, memoizedSetTechnologies]);

  const processedTechnologies = useMemo(() => {
    return technologies.map(tech => ({
      ...tech,
      creators: tech.creators.map((creator: Creator) => ({
        ...creator,
        videos: creator.videos.map((video: Video) => ({
          ...video,
          status: userStatuses[video.id] || 'Not Started',
        })),
      })),
    }));
  }, [technologies, userStatuses]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const updateVideoStatus = async (videoId: string, status: Video['status']) => {
    if (!user) return;
    const userStatusesRef = doc(db, `users/${user.uid}/videoStatuses`, videoId);
    try {
        await setDoc(userStatusesRef, { status }, { merge: true });
    } catch (e) {
        console.error("Failed to update status: ", e);
    }
  };

  const addTechnology = async (tech: Omit<Technology, 'id' | 'creators'>): Promise<string> => {
    const { name, description } = tech;
    const docRef = await addDoc(collection(db, 'technologies'), { name, description });
    return docRef.id;
  };

  const addCreator = async (techId: string, creator: { name: string; }): Promise<string> => {
    if (!techId) throw new Error("Technology ID is required to add a creator.");
    
    const docRef = await addDoc(collection(db, `technologies/${techId}/creators`), {
        name: creator.name,
        avatar: `https://placehold.co/100x100/1E3A8A/FFFFFF/png?text=${creator.name.charAt(0)}`
    });
    return docRef.id;
  };

  const addVideo = async (techId: string, creatorId: string, video: Omit<Video, 'id' | 'status'> & { createdAt?: Timestamp }) => {
    const { title, duration, url, createdAt } = video;
    const videoData: any = {
        title,
        duration,
        url,
        createdAt: createdAt || serverTimestamp(),
    };
    await addDoc(collection(db, `technologies/${techId}/creators/${creatorId}/videos`), videoData);
  };
  
  const addBulkData = async (data: BulkDataItem[], onProgress: (progress: number) => void) => {
    const localTechCache: (Omit<Technology, 'creators'> & { creators: (Omit<Creator, 'videos'>)[] })[] = JSON.parse(JSON.stringify(technologies));

    for (let i = 0; i < data.length; i++) {
        const item = data[i];

        if (!item.technology || !item.creator || !item.videoTitle || !item.duration || !item.url) {
            console.warn('Skipping row due to missing required fields:', item);
            continue;
        }

        let tech = localTechCache.find(t => t.name.toLowerCase() === item.technology.toLowerCase());
        if (!tech) {
            const newTechId = await addTechnology({ name: item.technology, description: '' });
            tech = { id: newTechId, name: item.technology, description: '', creators: [] };
            localTechCache.push(tech);
        }

        let creator = tech.creators.find(c => c.name.toLowerCase() === item.creator.toLowerCase());
        if (!creator) {
            const newCreatorId = await addCreator(tech.id, { name: item.creator });
            creator = { id: newCreatorId, name: item.creator, avatar: '' }; // Avatar is set in addCreator
            tech.creators.push(creator);
        }

        const videoData: Omit<Video, 'id' | 'status'> & { createdAt?: Timestamp } = {
            title: item.videoTitle,
            duration: item.duration,
            url: item.url,
        };

        if (item.creationDate && !isNaN(item.creationDate.getTime())) {
            videoData.createdAt = Timestamp.fromDate(item.creationDate);
        }

        await addVideo(tech.id, creator.id, videoData);
        onProgress(((i + 1) / data.length) * 100);
    }
};


  const deleteSubcollection = async (batch: WriteBatch, collectionPath: string) => {
    const q = query(collection(db, collectionPath));
    const snapshot = await getDocs(q);
    snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
    });
  };

  const deleteTechnology = async (techId: string) => {
    const batch = writeBatch(db);
    const techDocRef = doc(db, 'technologies', techId);

    const creatorsSnapshot = await getDocs(collection(db, `technologies/${techId}/creators`));
    for (const creatorDoc of creatorsSnapshot.docs) {
      await deleteSubcollection(batch, `technologies/${techId}/creators/${creatorDoc.id}/videos`);
      batch.delete(creatorDoc.ref);
    }

    batch.delete(techDocRef);
    await batch.commit();
  };

  const deleteCreator = async (techId: string, creatorId: string) => {
    const batch = writeBatch(db);
    const creatorDocRef = doc(db, `technologies/${techId}/creators`, creatorId);

    await deleteSubcollection(batch, `technologies/${techId}/creators/${creatorId}/videos`);

    batch.delete(creatorDocRef);
    await batch.commit();
  };

  const deleteVideo = async (techId: string, creatorId: string, videoId: string) => {
    await deleteDoc(doc(db, `technologies/${techId}/creators/${creatorId}/videos`, videoId));
  };

  return (
    <UserContext.Provider value={{
        user,
        isAdmin,
        technologies: processedTechnologies,
        loading,
        signInWithGoogle,
        logout,
        updateVideoStatus,
        addTechnology,
        addCreator,
        addVideo,
        deleteTechnology,
        deleteCreator,
        deleteVideo,
        addBulkData
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
