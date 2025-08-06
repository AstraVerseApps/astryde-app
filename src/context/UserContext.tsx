
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
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
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
        setIsAdmin(!!(adminEmail && currentUser.email === adminEmail));
      } else {
        setIsAdmin(false);
      }
      setAuthLoading(false);
    });
    return () => authUnsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
        setTechnologies([]);
        setDataLoading(false);
        return;
    }

    setDataLoading(true);

    let technologyUnsubscribe: Unsubscribe;
    let creatorUnsubscribes: Unsubscribe[] = [];
    let videoUnsubscribes: Unsubscribe[] = [];
    let statusUnsubscribe: Unsubscribe;

    const unsubAll = () => {
        if (technologyUnsubscribe) technologyUnsubscribe();
        creatorUnsubscribes.forEach(unsub => unsub());
        videoUnsubscribes.forEach(unsub => unsub());
        if (statusUnsubscribe) statusUnsubscribe();
    };

    const fetchAllData = () => {
        unsubAll(); // Unsubscribe from previous listeners

        // 1. Listen to video statuses first
        const statusesRef = collection(db, `users/${user.uid}/videoStatuses`);
        statusUnsubscribe = onSnapshot(statusesRef, (statusSnapshot) => {
            const userStatuses: Record<string, Video['status']> = {};
            statusSnapshot.docs.forEach(doc => {
                userStatuses[doc.id] = doc.data().status;
            });

            // 2. Listen to technologies
            const techQuery = query(collection(db, 'technologies'));
            technologyUnsubscribe = onSnapshot(techQuery, (techSnapshot) => {
                const techsFromDB: Technology[] = techSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), creators: [] } as Technology));
                
                let creatorsCompleted = 0;
                if (techsFromDB.length === 0) {
                    setTechnologies([]);
                    setDataLoading(false);
                    return;
                }

                const allCreators: Creator[][] = [];

                techsFromDB.forEach((tech, techIndex) => {
                    const creatorsQuery = query(collection(db, `technologies/${tech.id}/creators`));
                    const creatorUnsub = onSnapshot(creatorsQuery, (creatorSnapshot) => {
                        const creatorsFromDB: Creator[] = creatorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), videos: [] } as Creator));
                        allCreators[techIndex] = creatorsFromDB;

                        let videosCompleted = 0;
                        if (creatorsFromDB.length === 0) {
                             creatorsCompleted++;
                             if (creatorsCompleted === techsFromDB.length) {
                                setTechnologies(techsFromDB.map((t, i) => ({...t, creators: allCreators[i] || []})))
                                setDataLoading(false);
                             }
                             return;
                        }
                        
                        const allVideos: Video[][] = [];
                        
                        creatorsFromDB.forEach((creator, creatorIndex) => {
                             const videosQuery = query(collection(db, `technologies/${tech.id}/creators/${creator.id}/videos`), orderBy("createdAt", "asc"));
                             const videoUnsub = onSnapshot(videosQuery, (videoSnapshot) => {
                                const videosFromDB: Video[] = videoSnapshot.docs.map(doc => ({
                                    id: doc.id,
                                    ...doc.data(),
                                    status: userStatuses[doc.id] || 'Not Started'
                                } as Video));
                                
                                allVideos[creatorIndex] = videosFromDB;
                                videosCompleted++;
                                
                                if (videosCompleted === creatorsFromDB.length) {
                                    creatorsFromDB.forEach((c, i) => c.videos = allVideos[i] || []);
                                    creatorsCompleted++;
                                    
                                    if (creatorsCompleted === techsFromDB.length) {
                                        techsFromDB.forEach((t, i) => t.creators = allCreators[i] || []);
                                        setTechnologies(techsFromDB);
                                        setDataLoading(false);
                                    }
                                }
                             });
                             videoUnsubscribes.push(videoUnsub);
                        });
                    });
                    creatorUnsubscribes.push(creatorUnsub);
                });
            });
        });
    };

    fetchAllData();

    return () => {
        unsubAll();
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
        await setDoc(userStatusesRef, { status, techId, creatorId }, { merge: true });
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
