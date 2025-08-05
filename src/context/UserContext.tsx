
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, writeBatch, deleteDoc, setDoc, addDoc, getDocs, query, Unsubscribe } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Video, Technology, Creator } from '@/types';

interface UserContextType {
  user: User | null;
  isAdmin: boolean;
  technologies: Technology[];
  loading: boolean;
  signInWithGoogle: () => void;
  logout: () => void;
  updateVideoStatus: (videoId: string, status: Video['status']) => Promise<void>;
  addTechnology: (tech: Omit<Technology, 'id' | 'creators'>) => Promise<void>;
  addCreator: (techId: string, creator: { name: string; }) => Promise<void>;
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
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        setIsAdmin(!!(adminEmail && currentUser.email === adminEmail));
      } else {
        setIsAdmin(false);
      }
      // Loading state will be managed by data fetching useEffects
    });
    return () => authUnsubscribe();
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

    const technologiesRef = collection(db, 'technologies');
    const techUnsubscribe = onSnapshot(technologiesRef, (techSnapshot) => {
      if (techSnapshot.empty) {
        setTechnologies([]);
        setLoading(false);
        return;
      }
      
      const technologiesData: { [id: string]: Omit<Technology, 'creators'> } = {};
      techSnapshot.docs.forEach(doc => {
        technologiesData[doc.id] = { id: doc.id, ...(doc.data() as Omit<Technology, 'id' | 'creators'>) };
      });

      const allCreatorUnsubs: Unsubscribe[] = [];

      techSnapshot.docs.forEach(techDoc => {
        const creatorsRef = collection(db, `technologies/${techDoc.id}/creators`);
        const creatorUnsub = onSnapshot(creatorsRef, (creatorSnapshot) => {
          
          const creatorsData: { [id: string]: Omit<Creator, 'videos'> } = {};
           if (creatorSnapshot.empty) {
            setTechnologies(currentTechs => currentTechs.map(t => t.id === techDoc.id ? { ...technologiesData[techDoc.id], creators: [] } : t));
          }
          creatorSnapshot.docs.forEach(creatorDoc => {
            creatorsData[creatorDoc.id] = { id: creatorDoc.id, ...(creatorDoc.data() as Omit<Creator, 'id' | 'videos'>) };
          });

          const allVideoUnsubs: Unsubscribe[] = [];
          
          creatorSnapshot.docs.forEach(creatorDoc => {
            const videosRef = collection(db, `technologies/${techDoc.id}/creators/${creatorDoc.id}/videos`);
            const videoUnsub = onSnapshot(videosRef, (videoSnapshot) => {
              
              const videosData: Video[] = [];
               videoSnapshot.docs.forEach(videoDoc => {
                videosData.push({ 
                  id: videoDoc.id, 
                  ...(videoDoc.data() as Omit<Video, 'id'>),
                   status: userStatuses[videoDoc.id] || 'Not Started'
                });
              });
              
              setTechnologies(currentTechs => {
                const updatedTechs = currentTechs.map(t => ({...t})); // Deep copy
                const techIndex = updatedTechs.findIndex(t => t.id === techDoc.id);

                if (techIndex !== -1) {
                  const creatorIndex = updatedTechs[techIndex].creators.findIndex(c => c.id === creatorDoc.id);
                  if (creatorIndex !== -1) {
                    updatedTechs[techIndex].creators[creatorIndex] = {
                      ...updatedTechs[techIndex].creators[creatorIndex],
                      videos: videosData,
                    };
                  } else {
                     updatedTechs[techIndex].creators.push({
                      ...creatorsData[creatorDoc.id],
                      videos: videosData,
                    });
                  }
                } else {
                  updatedTechs.push({
                    ...technologiesData[techDoc.id],
                    creators: [{ ...creatorsData[creatorDoc.id], videos: videosData }]
                  });
                }
                return updatedTechs;
              });

            });
            allVideoUnsubs.push(videoUnsub);
          });
          
          setTechnologies(currentTechs => {
            const updatedTechs = [...currentTechs];
            const techIndex = updatedTechs.findIndex(t => t.id === techDoc.id);
            const newCreators = Object.values(creatorsData).map(c => {
                const existingCreator = updatedTechs[techIndex]?.creators.find(ec => ec.id === c.id);
                return existingCreator ? { ...c, videos: existingCreator.videos } : { ...c, videos: [] };
            });

            if (techIndex !== -1) {
                 updatedTechs[techIndex] = {
                    ...updatedTechs[techIndex],
                    creators: newCreators
                };
            } else {
                 updatedTechs.push({
                    ...technologiesData[techDoc.id],
                    creators: newCreators,
                });
            }
            return updatedTechs;
          });

        });
        allCreatorUnsubs.push(creatorUnsub);
      });

      setLoading(false); // Set loading to false once initial data structure is set up
    });

    return () => {
      statusesUnsubscribe();
      techUnsubscribe();
    };
  }, [user]);

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

  const addTechnology = async (tech: Omit<Technology, 'id' | 'creators'>) => {
    const { name, description } = tech;
    await addDoc(collection(db, 'technologies'), { name, description });
  };

  const addCreator = async (techId: string, creator: { name: string; }) => {
    if (!techId) throw new Error("Technology ID is required to add a creator.");
    
    await addDoc(collection(db, `technologies/${techId}/creators`), {
        name: creator.name,
        avatar: `https://placehold.co/100x100/1E3A8A/FFFFFF/png?text=${creator.name.charAt(0)}`
    });
  };

  const addVideo = async (techId: string, creatorId: string, video: Omit<Video, 'id' | 'status'>) => {
    await addDoc(collection(db, `technologies/${techId}/creators/${creatorId}/videos`), { 
        title: video.title,
        duration: video.duration,
        url: video.url,
    });
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
