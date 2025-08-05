
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useMemo, useCallback } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, writeBatch, deleteDoc, setDoc, addDoc, getDocs, query, Unsubscribe, DocumentData } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '@/lib/firebase';
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
  addCreator: (techId: string, creator: { name: string; avatar: File | string; }) => Promise<void>;
  addVideo: (techId: string, creatorId: string, video: Omit<Video, 'id' | 'status'> & { thumbnail: File | string; }) => Promise<void>;
  deleteTechnology: (techId: string) => Promise<void>;
  deleteCreator: (techId: string, creatorId: string) => Promise<void>;
  deleteVideo: (techId: string, creatorId: string, videoId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const uploadFile = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
};


export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [userStatuses, setUserStatuses] = useState<Record<string, Video['status']>>({});

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL);

      if (currentUser) {
        const userStatusesRef = collection(db, `users/${currentUser.uid}/videoStatuses`);
        const userStatusesUnsub = onSnapshot(userStatusesRef, (snapshot) => {
          const newStatuses: Record<string, Video['status']> = {};
          snapshot.forEach(doc => {
            newStatuses[doc.id] = doc.data().status;
          });
          setUserStatuses(newStatuses);
        });

        const technologiesQuery = query(collection(db, 'technologies'));
        const technologiesUnsub = onSnapshot(technologiesQuery, (techSnapshot) => {
          const techPromises = techSnapshot.docs.map(techDoc => {
            return new Promise<Technology>(async (resolve) => {
              const techData = techDoc.data();
              const tech: Technology = {
                id: techDoc.id,
                name: techData.name,
                description: techData.description,
                icon: getIconComponent(techData.iconName),
                creators: [],
              };

              const creatorsQuery = query(collection(db, `technologies/${techDoc.id}/creators`));
              const creatorsUnsub = onSnapshot(creatorsQuery, async (creatorSnapshot) => {
                const creatorPromises = creatorSnapshot.docs.map(creatorDoc => {
                  return new Promise<Creator>(async (resolveCreator) => {
                    const creatorData = creatorDoc.data();
                    const creator: Creator = {
                      id: creatorDoc.id,
                      name: creatorData.name,
                      avatar: creatorData.avatar,
                      videos: [],
                    };

                    const videosQuery = query(collection(db, `technologies/${techDoc.id}/creators/${creatorDoc.id}/videos`));
                    const videosUnsub = onSnapshot(videosQuery, (videoSnapshot) => {
                       creator.videos = videoSnapshot.docs.map(videoDoc => {
                        const videoData = videoDoc.data();
                        return {
                           id: videoDoc.id,
                           title: videoData.title,
                           duration: videoData.duration,
                           thumbnail: videoData.thumbnail,
                           url: videoData.url,
                           status: 'Not Started'
                        }
                       });
                       
                       setTechnologies(prev => {
                          const newTechnologies = [...prev];
                          const techIndex = newTechnologies.findIndex(t => t.id === tech.id);
                          if (techIndex > -1) {
                            const creatorIndex = newTechnologies[techIndex].creators.findIndex(c => c.id === creator.id);
                            if (creatorIndex > -1) {
                              newTechnologies[techIndex].creators[creatorIndex] = creator;
                            } else {
                              newTechnologies[techIndex].creators.push(creator)
                            }
                          }
                          return newTechnologies;
                       });
                       resolveCreator(creator);
                    });
                     // Note: We are not returning unsub functions from these nested listeners which is not ideal
                     // but simplifies logic for now. A more robust solution might manage these dynamically.
                  });
                });
                tech.creators = await Promise.all(creatorPromises);
                resolve(tech);
              });
            });
          });

          Promise.all(techPromises).then(fetchedTechnologies => {
             setTechnologies(fetchedTechnologies);
             setLoading(false);
          });
        });
        
        return () => {
          technologiesUnsub();
          userStatusesUnsub();
        }
      } else {
        setLoading(false);
        setUser(null);
        setIsAdmin(false);
        setTechnologies([]);
        setUserStatuses({});
      }
    });

    return () => unsubscribeAuth();
  }, []);

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

  const addTechnology = async (tech: Omit<Technology, 'id' | 'creators' | 'icon'> & { iconName: string }) => {
    const { name, description, iconName } = tech;
    await addDoc(collection(db, 'technologies'), { name, description, iconName });
  };

  const addCreator = async (techId: string, creator: { name: string; avatar: File | string; }) => {
    if (!techId) throw new Error("Technology ID is required to add a creator.");
    
    let avatarUrl = typeof creator.avatar === 'string' ? creator.avatar : 'https://placehold.co/100x100';
    if (creator.avatar instanceof File) {
        avatarUrl = await uploadFile(creator.avatar, `avatars/${creator.avatar.name}_${Date.now()}`);
    }

    await addDoc(collection(db, `technologies/${techId}/creators`), {
        name: creator.name,
        avatar: avatarUrl
    });
  };

  const addVideo = async (techId: string, creatorId: string, video: Omit<Video, 'id' | 'status'> & { thumbnail: File | string }) => {
    let thumbnailUrl = typeof video.thumbnail === 'string' ? video.thumbnail : 'https://placehold.co/1280x720';
    if (video.thumbnail instanceof File) {
        thumbnailUrl = await uploadFile(video.thumbnail, `thumbnails/${video.thumbnail.name}_${Date.now()}`);
    }

    await addDoc(collection(db, `technologies/${techId}/creators/${creatorId}/videos`), { 
        title: video.title,
        duration: video.duration,
        url: video.url,
        thumbnail: thumbnailUrl,
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

    await deleteSubcollection(batch, `technologies/${techId}/creators/${creatorDoc.id}/videos`);

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
