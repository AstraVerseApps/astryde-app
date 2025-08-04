
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, writeBatch, deleteDoc, setDoc, addDoc, getDocs, query, Unsubscribe } from 'firebase/firestore';
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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === 'astrydeapp@gmail.com');
      
      let masterUnsubscribe: Unsubscribe | null = null;

      if (currentUser) {
        setLoading(true);

        // Listener for user-specific video statuses
        const userStatusesRef = collection(db, `users/${currentUser.uid}/videoStatuses`);
        const unsubscribeUserStatuses = onSnapshot(userStatusesRef, (snapshot) => {
          const newStatuses: Record<string, Video['status']> = {};
          snapshot.forEach(doc => {
            newStatuses[doc.id] = doc.data().status;
          });
          setUserStatuses(newStatuses);
        });

        // This is the master listener for the top-level 'technologies' collection.
        const technologiesCollectionRef = collection(db, 'technologies');
        const technologyListeners = new Map<string, Unsubscribe>();

        masterUnsubscribe = onSnapshot(technologiesCollectionRef, (techSnapshot) => {
          const currentTechIds = new Set<string>();

          const techPromises = techSnapshot.docs.map(async (techDoc) => {
            currentTechIds.add(techDoc.id);
            const techData = techDoc.data() as Omit<Technology, 'id' | 'creators' | 'icon'> & { iconName: string };

            return new Promise<Technology>((resolve) => {
              const creatorsCollectionRef = collection(db, `technologies/${techDoc.id}/creators`);
              
              if (!technologyListeners.has(techDoc.id)) {
                  const creatorListeners = new Map<string, Unsubscribe>();
                  
                  const unsubscribeCreators = onSnapshot(creatorsCollectionRef, (creatorSnapshot) => {
                      const currentCreatorIds = new Set<string>();

                      const creatorPromises = creatorSnapshot.docs.map(async (creatorDoc) => {
                          currentCreatorIds.add(creatorDoc.id);
                          const creatorData = creatorDoc.data() as Omit<Creator, 'id' | 'videos'>;

                          return new Promise<Creator>((resolveCreator) => {
                              const videosCollectionRef = collection(db, `technologies/${techDoc.id}/creators/${creatorDoc.id}/videos`);

                              if (!creatorListeners.has(creatorDoc.id)) {
                                  const unsubscribeVideos = onSnapshot(videosCollectionRef, (videosSnapshot) => {
                                      const videos = videosSnapshot.docs.map(videoDoc => ({
                                          id: videoDoc.id,
                                          ...videoDoc.data()
                                      } as Video));
                                      resolveCreator({ id: creatorDoc.id, ...creatorData, videos });
                                  });
                                  creatorListeners.set(creatorDoc.id, unsubscribeVideos);
                              }
                          });
                      });

                      // Unsubscribe from deleted creators
                      creatorListeners.forEach((unsub, id) => {
                          if (!currentCreatorIds.has(id)) {
                              unsub();
                              creatorListeners.delete(id);
                          }
                      });

                      Promise.all(creatorPromises).then(creators => {
                          resolve({ id: techDoc.id, ...techData, creators: creators.filter(Boolean) as Creator[] });
                      });
                  });
                  technologyListeners.set(techDoc.id, unsubscribeCreators);
              } else {
                 // The listener already exists, we just need to resolve the tech data
                 // for the state update. The existing listener will handle creator/video changes.
                 const existingTech = technologies.find(t => t.id === techDoc.id);
                 resolve({ id: techDoc.id, ...techData, creators: existingTech?.creators || [] });
              }
            });
          });
          
          // Unsubscribe from deleted technologies
          technologyListeners.forEach((unsub, id) => {
            if (!currentTechIds.has(id)) {
              unsub();
              technologyListeners.delete(id);
            }
          });

          Promise.all(techPromises).then((newTechnologies) => {
            setTechnologies(newTechnologies.filter(Boolean) as Technology[]);
            if(loading) setLoading(false);
          });
        });

        return () => {
          unsubscribeUserStatuses();
          if (masterUnsubscribe) {
            masterUnsubscribe();
          }
          technologyListeners.forEach(unsub => unsub());
        };

      } else {
        setUser(null);
        setIsAdmin(false);
        setTechnologies([]);
        setUserStatuses({});
        setLoading(false);
        if (masterUnsubscribe) {
            masterUnsubscribe();
        }
      }
    });

    return () => unsubscribeAuth();
  }, []); // Only runs on mount and when auth changes

  const processedTechnologies = useMemo(() => {
    return technologies.map(tech => ({
      ...tech,
      icon: getIconComponent((tech as any).iconName),
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

    await deleteSubcollection(batch, `technologies/${techId}/creators/${creatorDoc.id}/videos`);

    batch.delete(creatorDoc.ref);
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

    