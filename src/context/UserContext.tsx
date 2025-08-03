
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Video, Technology, Creator } from '@/types';
import { technologies as initialTechnologies } from '@/lib/data';
import { BrainCircuit, AppWindow, Cloud, Database } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, writeBatch, deleteDoc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

const iconMap: Record<string, React.ElementType> = {
  AppWindow,
  Cloud,
  Database,
  BrainCircuit,
};

const getIconComponent = (iconName?: string) => {
    if (!iconName) return BrainCircuit;
    return iconMap[iconName] || BrainCircuit;
};

interface UserContextType {
  user: { email: string; displayName: string; photoURL?: string } | null;
  isAdmin: boolean;
  technologies: Technology[];
  allVideosForUser: Video[];
  login: (email: string) => void;
  logout: () => void;
  updateVideoStatus: (videoId: string, status: Video['status']) => Promise<void>;
  addTechnology: (tech: Omit<Technology, 'id' | 'creators' | 'icon'> & {iconName: string}) => Promise<void>;
  addCreator: (techId: string, creator: Omit<Creator, 'id' | 'videos'>) => Promise<void>;
  addVideo: (techId: string, creatorId: string, video: Omit<Video, 'id' | 'status'>) => Promise<void>;
  deleteTechnology: (techId: string) => Promise<void>;
  deleteCreator: (techId: string, creatorId: string) => Promise<void>;
  deleteVideo: (techId: string, creatorId: string, videoId: string) => Promise<void>;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ email: string; displayName: string; photoURL?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);

  const seedDatabase = useCallback(async () => {
    console.log("Seeding database...");
    const batch = writeBatch(db);
    initialTechnologies.forEach(tech => {
        const techDocRef = doc(db, "technologies", tech.id);
        const { creators, icon, ...techData } = tech;
        const iconName = (icon as any).displayName || 'BrainCircuit';
        batch.set(techDocRef, { name: techData.name, description: techData.description, id: techData.id, iconName });

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
    console.log("Database seeded.");
  }, []);

  const processTechSnapshot = async (techSnapshot: any, userEmail?: string | null): Promise<Technology[]> => {
    const techList: Technology[] = [];
    for (const techDoc of techSnapshot.docs) {
        const techData = techDoc.data();
        const tech: Technology = {
            id: techDoc.id,
            name: techData.name,
            description: techData.description,
            icon: getIconComponent(techData.iconName),
            creators: [],
        };

        const creatorsCollection = collection(db, `technologies/${tech.id}/creators`);
        const creatorsSnapshot = await getDocs(creatorsCollection);
        const userProgress = userEmail ? (await getDoc(doc(db, `users/${userEmail}`))).data()?.progress || {} : {};

        for (const creatorDoc of creatorsSnapshot.docs) {
            const creatorData = creatorDoc.data();
            const creator: Creator = {
                id: creatorDoc.id,
                name: creatorData.name,
                avatar: creatorData.avatar,
                videos: [],
            };

            const videosCollection = collection(db, `technologies/${tech.id}/creators/${creator.id}/videos`);
            const videosSnapshot = await getDocs(videosCollection);
            
            for (const videoDoc of videosSnapshot.docs) {
                const videoData = videoDoc.data();
                const video: Video = {
                    id: videoDoc.id,
                    title: videoData.title,
                    duration: videoData.duration,
                    thumbnail: videoData.thumbnail,
                    url: videoData.url,
                    status: userProgress[videoDoc.id] || 'Not Started',
                };
                creator.videos.push(video);
            }
            tech.creators.push(creator);
        }
        techList.push(tech);
    }
    return techList;
  }

  const fetchTechnologies = useCallback(async (userEmail?: string | null) => {
    try {
        const techCollection = collection(db, 'technologies');
        const techSnapshot = await getDocs(techCollection);

        let fetchedTechnologies: Technology[];

        if (techSnapshot.empty) {
            await seedDatabase();
            const newTechSnapshot = await getDocs(techCollection);
            fetchedTechnologies = await processTechSnapshot(newTechSnapshot, userEmail);
        } else {
            fetchedTechnologies = await processTechSnapshot(techSnapshot, userEmail);
        }
        setTechnologies(fetchedTechnologies);
    } catch(e) {
        console.error("Error fetching technologies:", e);
    }
  }, [seedDatabase]);


  useEffect(() => {
    const initialize = async () => {
        setLoading(true);
        try {
            const storedUser = localStorage.getItem('astryde-user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setIsAdmin(parsedUser.email === 'astrydeapp@gmail.com');
                await fetchTechnologies(parsedUser.email);
            } else {
                await fetchTechnologies(null);
            }
        } catch (error) {
            console.error("Initialization failed:", error);
            // Even if it fails, stop loading to not get stuck
        } finally {
            setLoading(false);
        }
    };

    initialize();
  }, [fetchTechnologies]);

  const login = (email: string) => {
    const newUser = {
        email,
        displayName: email.split('@')[0],
        photoURL: ''
    };
    localStorage.setItem('astryde-user', JSON.stringify(newUser));
    setUser(newUser);
    setIsAdmin(newUser.email === 'astrydeapp@gmail.com');
    setLoading(true);
    fetchTechnologies(newUser.email).finally(() => setLoading(false));
  }

  const logout = async () => {
    localStorage.removeItem('astryde-user');
    setUser(null);
    setIsAdmin(false);
    setLoading(true);
    fetchTechnologies(null).finally(() => setLoading(false));
  };
  
  const updateVideoStatus = async (videoId: string, status: Video['status']) => {
    if (!user || !user.email) return;

    setTechnologies(prevTechs => prevTechs.map(tech => ({
      ...tech,
      creators: tech.creators.map(creator => ({
        ...creator,
        videos: creator.videos.map(video => 
          video.id === videoId ? { ...video, status } : video
        )
      }))
    })));

    const userRef = doc(db, `users/${user.email}`);
    try {
        await updateDoc(userRef, {
            [`progress.${videoId}`]: status
        });
    } catch (e) {
        await setDoc(userRef, { progress: { [videoId]: status } }, { merge: true });
    }
  };

  const addTechnology = async (tech: Omit<Technology, 'id' | 'creators' | 'icon'> & {iconName: string}) => {
    const id = `tech-${Date.now()}`;
    const { iconName, ...rest } = tech;
    const newTechnology = {
        ...rest,
        id,
        iconName,
    };
    await setDoc(doc(db, "technologies", id), {name: newTechnology.name, description: newTechnology.description, iconName: newTechnology.iconName});
    await fetchTechnologies(user?.email);
  };

  const addCreator = async (techId: string, creator: Omit<Creator, 'id' | 'videos'>) => {
      const id = `creator-${Date.now()}`;
      await setDoc(doc(db, `technologies/${techId}/creators`, id), creator);
      await fetchTechnologies(user?.email);
  };

  const addVideo = async (techId: string, creatorId: string, video: Omit<Video, 'id' | 'status'>) => {
      const id = `video-${Date.now()}`;
      await setDoc(doc(db, `technologies/${techId}/creators/${creatorId}/videos`, id), { ...video, status: 'Not Started' });
      await fetchTechnologies(user?.email);
  };

  const deleteTechnology = async (techId: string) => {
    const techRef = doc(db, "technologies", techId);
    
    const creatorsSnapshot = await getDocs(collection(techRef, "creators"));
    const batch = writeBatch(db);
    creatorsSnapshot.forEach(async (creatorDoc) => {
        const videosSnapshot = await getDocs(collection(creatorDoc.ref, "videos"));
        videosSnapshot.forEach(videoDoc => {
            batch.delete(videoDoc.ref);
        });
        batch.delete(creatorDoc.ref);
    });
    batch.delete(techRef);

    await batch.commit();
    await fetchTechnologies(user?.email);
  };

  const deleteCreator = async (techId: string, creatorId: string) => {
    const creatorRef = doc(db, `technologies/${techId}/creators`, creatorId);
    const videosSnapshot = await getDocs(collection(creatorRef, "videos"));
    const batch = writeBatch(db);
    videosSnapshot.forEach(videoDoc => {
        batch.delete(videoDoc.ref);
    });
    batch.delete(creatorRef);

    await batch.commit();
    await fetchTechnologies(user?.email);
  };

  const deleteVideo = async (techId: string, creatorId: string, videoId: string) => {
    await deleteDoc(doc(db, `technologies/${techId}/creators/${creatorId}/videos`, videoId));
    await fetchTechnologies(user?.email);
  };

  const allVideosForUser = technologies.flatMap(tech => 
    tech.creators.flatMap(c => c.videos.map(v => ({...v, creator: c.name, technology: tech.name})))
  );


  return (
    <UserContext.Provider value={{ 
        user, 
        isAdmin, 
        technologies,
        allVideosForUser,
        login, 
        logout, 
        updateVideoStatus,
        addTechnology,
        addCreator,
        addVideo,
        deleteTechnology,
        deleteCreator,
        deleteVideo,
        loading
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
