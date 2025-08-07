
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback, useMemo } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { collection, doc, onSnapshot, writeBatch, deleteDoc, setDoc, addDoc, getDocs, query, Unsubscribe, serverTimestamp, orderBy, Timestamp, where } from 'firebase/firestore';
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
  updateVideoStatus: (techId: string, creatorId: string, videoId: string, status: Video['status']) => Promise<void>;
  addTechnology: (tech: Omit<Technology, 'id' | 'creators'>) => Promise<string>;
  addCreator: (techId: string, creator: { name: string; }) => Promise<string>;
  addVideo: (techId: string, creatorId: string, video: Omit<Video, 'id' | 'status'> & { createdAt?: Timestamp }) => Promise<void>;
  deleteTechnology: (techId: string) => Promise<void>;
  deleteCreator: (techId: string, creatorId: string) => Promise<void>;
  deleteVideo: (techId: string, creatorId: string, videoId: string) => Promise<void>;
  addBulkData: (data: BulkDataItem[], onProgress: (progress: number) => void) => Promise<void>;
  toggleCreatorStar: (techId: string, creatorId: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(true);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [starredCreators, setStarredCreators] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        setIsAdmin(!!(adminEmail && currentUser.email === adminEmail));
      } else {
        setIsAdmin(false);
        setStarredCreators({}); // Clear starred creators on logout
      }
      setAuthLoading(false);
    });
    return () => authUnsubscribe();
  }, []);

  useEffect(() => {
    let unsubscribes: Unsubscribe[] = [];

    const fetchPublicData = () => {
        setDataLoading(true);
        const techQuery = query(collection(db, 'technologies'));
        const techUnsubscribe = onSnapshot(techQuery, async (techSnapshot) => {
            const publicTechnologies = await Promise.all(techSnapshot.docs.map(async (techDoc) => {
                const techData = { id: techDoc.id, ...techDoc.data(), creators: [] } as Technology;
                
                const creatorsQuery = query(collection(db, `technologies/${techDoc.id}/creators`));
                const creatorsSnapshot = await getDocs(creatorsQuery);
                techData.creators = await Promise.all(creatorsSnapshot.docs.map(async (creatorDoc) => {
                    const creatorData = { id: creatorDoc.id, ...creatorDoc.data(), videos: [] } as Creator;
                    
                    const videosQuery = query(collection(db, `technologies/${techDoc.id}/creators/${creatorDoc.id}/videos`), orderBy("createdAt", "asc"));
                    const videosSnapshot = await getDocs(videosQuery);
                    creatorData.videos = videosSnapshot.docs.map(videoDoc => {
                        const videoData = videoDoc.data();
                        return {
                            id: videoDoc.id,
                            ...videoData,
                            status: 'Not Started',
                            completedAt: videoData.completedAt,
                        } as Video;
                    });
                    return creatorData;
                }));
                return techData;
            }));

            if (user) {
                // If user is logged in, fetch their data and then merge
                fetchAndMergeUserData(publicTechnologies);
            } else {
                // If no user, just set the public data
                setTechnologies(publicTechnologies);
                setDataLoading(false);
            }
        });
        unsubscribes.push(techUnsubscribe);
    };

    const fetchAndMergeUserData = (publicTechnologies: Technology[]) => {
        if (!user) return;
        
        const statusQuery = query(collection(db, `users/${user.uid}/videoStatuses`));
        const statusUnsubscribe = onSnapshot(statusQuery, (statusSnapshot) => {
            const statuses: Record<string, { status: Video['status'], completedAt?: Timestamp }> = {};
            statusSnapshot.forEach((doc) => {
                statuses[doc.id] = {
                    status: doc.data().status,
                    completedAt: doc.data().completedAt,
                };
            });

            const newTechnologies = publicTechnologies.map(tech => ({
                ...tech,
                creators: tech.creators.map(creator => ({
                    ...creator,
                    videos: creator.videos.map(video => ({
                        ...video,
                        status: statuses[video.id]?.status || 'Not Started',
                        completedAt: statuses[video.id]?.completedAt,
                    }))
                }))
            }));
            
            // This is where starred creators listener should also be
            const starredQuery = query(collection(db, `users/${user.uid}/starredCreators`));
            const starredUnsubscribe = onSnapshot(starredQuery, (snapshot) => {
                const newStarred: Record<string, boolean> = {};
                snapshot.forEach(doc => { newStarred[doc.id] = true; });
                setStarredCreators(newStarred);

                // Now combine starred status into the final object
                const finalTechnologies = newTechnologies.map(tech => ({
                    ...tech,
                    creators: tech.creators.map(creator => ({
                        ...creator,
                        isStarred: !!newStarred[`${tech.id}_${creator.id}`]
                    }))
                }));

                setTechnologies(finalTechnologies);
                setDataLoading(false);
            });
            unsubscribes.push(starredUnsubscribe);
        });
        unsubscribes.push(statusUnsubscribe);
    };

    fetchPublicData();

    return () => {
        unsubscribes.forEach(unsub => unsub());
    };
  }, [user]);


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

  const updateVideoStatus = async (techId: string, creatorId: string, videoId: string, status: Video['status']) => {
    if (!user) return;
    const userStatusesRef = doc(db, `users/${user.uid}/videoStatuses`, videoId);
    try {
        const dataToSet: { status: string; techId: string; creatorId: string; completedAt?: Timestamp } = { 
            status,
            techId,
            creatorId 
        };
        if (status === 'Completed') {
            dataToSet.completedAt = Timestamp.now();
        }

        await setDoc(userStatusesRef, dataToSet, { merge: true });
    } catch (e) {
        console.error("Failed to update status: ", e);
    }
  };

  const toggleCreatorStar = async (techId: string, creatorId: string) => {
    if (!user) return;
    const starId = `${techId}_${creatorId}`;
    const starRef = doc(db, `users/${user.uid}/starredCreators`, starId);
    const isCurrentlyStarred = !!starredCreators[starId];

    try {
      if (isCurrentlyStarred) {
        await deleteDoc(starRef);
      } else {
        await setDoc(starRef, { starredAt: serverTimestamp() });
      }
    } catch (error) {
        console.error("Failed to toggle star:", error);
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
  
  const findOrCreateDocument = async (collPath: string, fieldName: string, fieldValue: string, createData: any) => {
    const q = query(collection(db, collPath), where(fieldName, "==", fieldValue));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
        return querySnapshot.docs[0].id;
    } else {
        const docRef = await addDoc(collection(db, collPath), createData);
        return docRef.id;
    }
  };

  const addBulkData = useCallback(async (data: BulkDataItem[], onProgress: (progress: number) => void) => {
    let i = 0;
    const techIdCache: Record<string, string> = {};
    const creatorIdCache: Record<string, string> = {};

    for (const item of data) {
      try {
        if (!item.technology || !item.creator || !item.videoTitle || !item.duration || !item.url) {
          console.warn('Skipping row due to missing required fields:', item);
          continue;
        }

        // Find or create technology
        let techId = techIdCache[item.technology];
        if (!techId) {
          techId = await findOrCreateDocument('technologies', 'name', item.technology, {
            name: item.technology,
            description: '',
          });
          techIdCache[item.technology] = techId;
        }

        // Find or create creator
        const creatorCacheKey = `${techId}_${item.creator}`;
        let creatorId = creatorIdCache[creatorCacheKey];
        if (!creatorId) {
          creatorId = await findOrCreateDocument(`technologies/${techId}/creators`, 'name', item.creator, {
            name: item.creator,
            avatar: `https://placehold.co/100x100/1E3A8A/FFFFFF/png?text=${item.creator.charAt(0)}`,
          });
          creatorIdCache[creatorCacheKey] = creatorId;
        }

        // Prepare video data
        const videoData: Omit<Video, 'id' | 'status'> & { createdAt?: Timestamp } = {
          title: item.videoTitle,
          duration: item.duration,
          url: item.url,
        };
        
        if (item.creationDate) {
            let date: Date;
            if(typeof item.creationDate === 'number') {
                date = new Date(Math.round((item.creationDate - 25569) * 86400 * 1000));
            } else {
                date = new Date(item.creationDate);
            }

            if (!isNaN(date.getTime())) {
                videoData.createdAt = Timestamp.fromDate(date);
            }
        }

        await addVideo(techId, creatorId, videoData);

      } catch (error) {
        console.error("Error processing row:", item, "Error:", error);
      } finally {
        i++;
        onProgress((i / data.length) * 100);
      }
    }
  }, [addVideo]);


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
        technologies,
        loading: authLoading || dataLoading,
        signInWithGoogle,
        logout,
        updateVideoStatus,
        addTechnology,
        addCreator,
        addVideo,
        deleteTechnology,
        deleteCreator,
        deleteVideo,
        addBulkData,
        toggleCreatorStar
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
