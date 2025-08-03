
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, doc, getDocs, onSnapshot, writeBatch, runTransaction, getDoc, deleteDoc, setDoc, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { Video, Technology, Creator } from '@/types';
import { technologies as initialTechnologies } from '@/lib/data';
import { BrainCircuit, AppWindow, Cloud, Database } from 'lucide-react';
import { useRouter } from 'next/navigation';

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
                const { creators, icon, ...techData } = tech;
                const iconName = (icon as any).displayName || 'BrainCircuit';
                batch.set(techDocRef, { ...techData, name: tech.name, description: tech.description, iconName });

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
  login: (email: string) => void;
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
  const router = useRouter();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAdmin(currentUser?.email === 'astrydeapp@gmail.com');
      // Fetches user-specific data or sets up user-related listeners here if needed
      if (!currentUser) {
        setLoading(false);
      }
    });

    const unsubscribeFirestore = onSnapshot(collection(db, "technologies"), async (snapshot) => {
      setLoading(true);
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
      setLoading(false);
    });

    seedDatabase();

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, []);

  const login = (email: string) => {
    // This is a mock login. In a real app, you'd use Firebase Auth methods.
    const mockUser = {
      uid: 'mock-uid',
      email: email,
      displayName: email.split('@')[0],
      photoURL: ''
    } as User;
    setUser(mockUser);
    setIsAdmin(mockUser.email === 'astrydeapp@gmail.com');
  };

  const logout = async () => {
    // In a real app, you'd use signOut(auth);
    setUser(null);
    setIsAdmin(false);
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

  const deleteTechnology = async (techId: string) => {
    // This is a simplified delete. A real implementation would delete subcollections.
    await deleteDoc(doc(db, 'technologies', techId));
  };
  
  const deleteCreator = async (techId: string, creatorId: string) => {
    await deleteDoc(doc(db, `technologies/${techId}/creators`, creatorId));
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
        login, 
        logout, 
        updateVideoStatus,
        addTechnology,
        addCreator,
        addVideo,
        deleteTechnology,
        deleteCreator,
        deleteVideo,
    }}>
      {!loading && children}
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
