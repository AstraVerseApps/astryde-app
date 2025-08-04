
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, writeBatch, deleteDoc, setDoc, addDoc, query, Unsubscribe, DocumentData } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Video, Technology, Creator } from '@/types';
import { BrainCircuit, AppWindow, Cloud, Database } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  AppWindow,
  Cloud,
  Database,
  BrainCircuit,
};

const getIconComponent = (iconName?: string) => {
    if (!iconName || !iconMap[iconName]) return BrainCircuit;
    return iconMap[iconName];
};

interface UserContextType {
  user: User | null;
  isAdmin: boolean;
  technologies: Technology[];
  loading: boolean;
  signInWithGoogle: () => void;
  logout: () => void;
  updateVideoStatus: (videoId: string, status: Video['status']) => Promise<void>;
  addTechnology: (tech: Omit<Technology, 'id' | 'creators' | 'icon'> & { iconName: string }) => Promise<void>;
  addCreator: (techId: string, creator: { name: string; avatar: string; }) => Promise<void>;
  addVideo: (techId: string, creatorId: string, video: Omit<Video, 'id' | 'status'>) => Promise<void>;
  deleteTechnology: (techId: string) => Promise<void>;
  deleteCreator: (techId: string, creatorId: string) => Promise<void>;
  deleteVideo: (techId: string, creatorId: string, videoId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStatuses, setUserStatuses] = useState<Record<string, Video['status']>>({});
  
  // This effect hook handles authentication state changes.
  // It sets up and tears down other listeners based on the user's auth state.
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setLoading(true);
      setUser(currentUser);
      setIsAdmin(currentUser?.email === 'astrydeapp@gmail.com');
      if (!currentUser) {
        setTechnologies([]);
        setUserStatuses({});
        setLoading(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);
  
  // This effect hook handles fetching user-specific video statuses.
  // It only runs when the user logs in or out.
  useEffect(() => {
    if (user) {
      const statusesCollectionRef = collection(db, `users/${user.uid}/videoStatuses`);
      const unsubscribeUserStatuses = onSnapshot(statusesCollectionRef, (snapshot) => {
        const statuses: Record<string, Video['status']> = {};
        snapshot.forEach(doc => {
          statuses[doc.id] = doc.data().status;
        });
        setUserStatuses(statuses);
      }, (error) => {
        console.error("Error fetching user statuses:", error);
      });
      return () => unsubscribeUserStatuses();
    }
  }, [user]);

  // This effect hook fetches the main technology data and sets up real-time listeners.
  // It runs once when the component mounts.
  useEffect(() => {
    const technologiesCollectionRef = collection(db, 'technologies');
    
    const unsubscribeTechnologies = onSnapshot(technologiesCollectionRef, async (techSnapshot) => {
        setLoading(true);
        const techsWithCreatorsAndVideos = await Promise.all(
            techSnapshot.docs.map(async (techDoc) => {
                const techData = techDoc.data() as Omit<Technology, 'id' | 'creators'>;
                
                const creatorsCollectionRef = collection(db, `technologies/${techDoc.id}/creators`);
                const creatorsSnapshot = await getDocs(creatorsCollectionRef);

                const creators = await Promise.all(
                    creatorsSnapshot.docs.map(async (creatorDoc) => {
                        const creatorData = creatorDoc.data() as Omit<Creator, 'id' | 'videos'>;
                        
                        const videosCollectionRef = collection(db, `technologies/${techDoc.id}/creators/${creatorDoc.id}/videos`);
                        const videosSnapshot = await getDocs(videosCollectionRef);
                        
                        const videos: Video[] = videosSnapshot.docs.map(videoDoc => ({
                            id: videoDoc.id,
                            ...(videoDoc.data() as Omit<Video, 'id'>),
                            status: 'Not Started' // Default status
                        }));

                        return { id: creatorDoc.id, ...creatorData, videos };
                    })
                );

                return { 
                    id: techDoc.id, 
                    ...techData, 
                    creators, 
                    iconName: (techData as any).iconName || 'BrainCircuit' 
                };
            })
        );
        setTechnologies(techsWithCreatorsAndVideos);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching technologies:", error);
        setLoading(false);
    });

    return () => unsubscribeTechnologies();
  }, []);


  const processedTechnologies = useMemo(() => {
    return technologies.map(tech => ({
      ...tech,
      icon: getIconComponent( (tech as any).iconName),
      creators: tech.creators.map((creator: Creator) => ({
          ...creator,
          videos: creator.videos.map((video: Video) => ({
              ...video,
              status: userStatuses[video.id] || video.status || 'Not Started',
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

  const addTechnology = async (tech: Omit<Technology, 'id' | 'creators' | 'icon'> & { iconName: string }) => {
    const { name, description, iconName } = tech;
    await addDoc(collection(db, 'technologies'), { name, description, iconName });
  };

  const addCreator = async (techId: string, creator: { name: string; avatar: string; }) => {
    if (!techId) throw new Error("Technology ID is required to add a creator.");
    await addDoc(collection(db, `technologies/${techId}/creators`), creator);
  };

  const addVideo = async (techId: string, creatorId: string, video: Omit<Video, 'id' | 'status'>) => {
    await addDoc(collection(db, `technologies/${techId}/creators/${creatorId}/videos`), { ...video, status: 'Not Started' });
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
