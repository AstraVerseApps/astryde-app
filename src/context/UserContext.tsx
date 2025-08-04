
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged, signInWithRedirect, GoogleAuthProvider, signOut, getRedirectResult } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, writeBatch, runTransaction, getDoc, deleteDoc, setDoc, addDoc, query, WriteBatch } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Video, Technology, Creator } from '@/types';
import { technologies as initialTechnologies } from '@/lib/data';
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

const processTechnologies = (docs: any[]): Technology[] => {
    return docs.map(doc => ({
      ...doc,
      icon: getIconComponent(doc.iconName),
    }));
};

const seedDatabase = async () => {
    try {
        const technologiesSnapshot = await getDocs(collection(db, 'technologies'));
        if (technologiesSnapshot.empty) {
            console.log('Database is empty, seeding...');
            const batch = writeBatch(db);

            initialTechnologies.forEach(tech => {
                const techDocRef = doc(db, 'technologies', tech.id);
                // Exclude icon component, only store iconName
                const { creators, icon, ...techData } = tech;
                const iconName = (icon as any).displayName || 'BrainCircuit';
                batch.set(techDocRef, { ...techData, iconName });

                tech.creators.forEach(creator => {
                    const creatorDocRef = doc(db, `technologies/${tech.id}/creators`, creator.id);
                    const { videos, ...creatorData } = creator;
                    batch.set(creatorDocRef, creatorData);

                    creator.videos.forEach(video => {
                        const videoDocRef = doc(db, `technologies/${tech.id}/creators/${creator.id}/videos`, video.id);
                        batch.set(videoDocRef, video);
                    });
                });
            });

            await batch.commit();
            console.log('Database seeded successfully.');
        } else {
            console.log('Database already contains data, skipping seed.');
        }
    } catch (error) {
        console.error("Error seeding database:", error);
    }
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
  addCreator: (techId: string, creator: Omit<Creator, 'id' | 'videos'>) => Promise<void>;
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

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, currentUser => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === 'astrydeapp@gmail.com');
      setLoading(false);
    });
    
    // Process the redirect result
    getRedirectResult(auth).catch(error => {
      // Handle errors here, such as user closing the popup.
      console.error("Error processing redirect result:", error);
      setLoading(false);
    });

    const unsubscribeFirestore = onSnapshot(collection(db, "technologies"), async (snapshot) => {
      if (snapshot.empty) {
        await seedDatabase();
      } else {
        const techs: Technology[] = [];
        for (const techDoc of snapshot.docs) {
          const techData = techDoc.data() as Omit<Technology, 'id' | 'creators'>;
          const creatorsSnapshot = await getDocs(collection(db, `technologies/${techDoc.id}/creators`));
          const creators: Creator[] = [];

          for (const creatorDoc of creatorsSnapshot.docs) {
            const creatorData = creatorDoc.data() as Omit<Creator, 'id' | 'videos'>;
            const videosSnapshot = await getDocs(collection(db, `technologies/${techDoc.id}/creators/${creatorDoc.id}/videos`));
            const videos: Video[] = videosSnapshot.docs.map(videoDoc => ({
              id: videoDoc.id,
              ...(videoDoc.data() as Omit<Video, 'id'>)
            }));
            creators.push({ id: creatorDoc.id, ...creatorData, videos });
          }
          techs.push({ id: techDoc.id, ...techData, creators });
        }
        setTechnologies(processTechnologies(techs));
      }
    });

    // Cleanup both listeners on unmount
    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithRedirect(auth, provider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      setLoading(false);
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
    try {
        await runTransaction(db, async (transaction) => {
            const userStatusesRef = doc(db, `users/${user.uid}/videoStatuses`, videoId);
            transaction.set(userStatusesRef, { status });
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
    }
  };
  
  const addTechnology = async (tech: Omit<Technology, 'id' | 'creators' | 'icon'> & { iconName: string }) => {
    const { name, description, iconName } = tech;
    await addDoc(collection(db, 'technologies'), { name, description, iconName });
  };

  const addCreator = async (techId: string, creator: Omit<Creator, 'id' | 'videos'>) => {
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
        technologies,
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
