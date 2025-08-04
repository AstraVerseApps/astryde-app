
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, writeBatch, deleteDoc, setDoc, addDoc, getDocs, query, Unsubscribe, DocumentData } from 'firebase/firestore';
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

      let allUnsubscribes: Unsubscribe[] = [];

      if (currentUser) {
        setLoading(true);

        const userStatusesRef = collection(db, `users/${currentUser.uid}/videoStatuses`);
        const unsubscribeUserStatuses = onSnapshot(userStatusesRef, (snapshot) => {
          const newStatuses: Record<string, Video['status']> = {};
          snapshot.forEach(doc => {
            newStatuses[doc.id] = doc.data().status;
          });
          setUserStatuses(newStatuses);
        });
        allUnsubscribes.push(unsubscribeUserStatuses);

        const technologiesCollectionRef = collection(db, 'technologies');
        const unsubscribeTechnologies = onSnapshot(technologiesCollectionRef, (techSnapshot) => {
          // Clean up old creator/video listeners before processing new tech list
          allUnsubscribes.filter(unsub => unsub !== unsubscribeTechnologies && unsub !== unsubscribeUserStatuses).forEach(unsub => unsub());
          allUnsubscribes = [unsubscribeTechnologies, unsubscribeUserStatuses];
          
          let techData: Technology[] = [];
          if(techSnapshot.empty) {
            setTechnologies([]);
            setLoading(false);
            return;
          }

          techSnapshot.forEach((techDoc) => {
            const tech: Technology = {
                id: techDoc.id,
                ...techDoc.data(),
                creators: [],
            } as Technology;
            techData.push(tech);

            // Nested listener for creators
            const creatorsRef = collection(db, `technologies/${techDoc.id}/creators`);
            const unsubscribeCreators = onSnapshot(creatorsRef, (creatorsSnapshot) => {
                let creatorsData: Creator[] = [];

                if(creatorsSnapshot.empty) {
                    setTechnologies(currentTechs => currentTechs.map(t => t.id === techDoc.id ? { ...t, creators: [] } : t));
                    return;
                }

                creatorsSnapshot.forEach((creatorDoc) => {
                    const creator: Creator = {
                        id: creatorDoc.id,
                        ...creatorDoc.data(),
                        videos: [],
                    } as Creator;
                    creatorsData.push(creator);

                    // Nested listener for videos
                    const videosRef = collection(db, `technologies/${techDoc.id}/creators/${creatorDoc.id}/videos`);
                    const unsubscribeVideos = onSnapshot(videosRef, (videosSnapshot) => {
                        const videosData = videosSnapshot.docs.map(videoDoc => ({
                            id: videoDoc.id,
                            ...videoDoc.data()
                        } as Video));

                        setTechnologies(currentTechs => {
                            return currentTechs.map(t => {
                                if (t.id === techDoc.id) {
                                    return {
                                        ...t,
                                        creators: t.creators.map(c => {
                                            if (c.id === creatorDoc.id) {
                                                return { ...c, videos: videosData };
                                            }
                                            return c;
                                        })
                                    };
                                }
                                return t;
                            });
                        });
                    });
                    allUnsubscribes.push(unsubscribeVideos);
                });

                setTechnologies(currentTechs => {
                   return currentTechs.map(t => {
                        if (t.id === techDoc.id) {
                            return { ...t, creators: creatorsData };
                        }
                        return t;
                   });
                });
            });
            allUnsubscribes.push(unsubscribeCreators);
          });
          
          setTechnologies(techData);
          setLoading(false);
        });

        allUnsubscribes.push(unsubscribeTechnologies);
      } else {
        setLoading(false);
        setUser(null);
        setIsAdmin(false);
        setTechnologies([]);
        setUserStatuses({});
        allUnsubscribes.forEach(unsub => unsub());
      }

      return () => {
        allUnsubscribes.forEach(unsub => unsub());
      };
    });

    return () => unsubscribeAuth();
  }, []);

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
