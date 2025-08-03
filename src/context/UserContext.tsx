
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
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

const processData = (technologies: any[]): Technology[] => {
    return technologies.map(tech => ({
        ...tech,
        icon: getIconComponent(typeof tech.icon === 'string' ? tech.icon : (tech.icon as any)?.displayName),
        creators: tech.creators.map((creator: any) => ({
            ...creator,
            videos: creator.videos.map((video: any) => ({
                ...video,
                status: video.status || 'Not Started' 
            }))
        }))
    }));
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
  
  useEffect(() => {
    setLoading(true);
    try {
        const storedUser = localStorage.getItem('astryde-user');
        const storedTech = localStorage.getItem('astryde-tech-data');

        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsAdmin(parsedUser.email === 'astrydeapp@gmail.com');
        }

        if (storedTech) {
            const parsedTech = JSON.parse(storedTech);
            setTechnologies(processData(parsedTech));
        } else {
            // This is to handle the case where there is no data in local storage
            // We map display names to the initial data so the icon components are functions not strings
            const initialData = initialTechnologies.map(t => ({...t, icon: (t.icon as any).displayName}))
            setTechnologies(processData(initialTechnologies));
            localStorage.setItem('astryde-tech-data', JSON.stringify(initialData));
        }
    } catch (e) {
        console.error("Error loading data from local storage", e);
        const initialData = processData(initialTechnologies);
        setTechnologies(initialData);
    } finally {
        setLoading(false);
    }
  }, []);

  const updateLocalStorage = (newTechs: Technology[]) => {
      localStorage.setItem('astryde-tech-data', JSON.stringify(newTechs.map(t => ({...t, icon: (t.icon as any).displayName || 'BrainCircuit'}))));
  };

  const login = (email: string) => {
    const newUser = {
        email,
        displayName: email.split('@')[0],
        photoURL: ''
    };
    localStorage.setItem('astryde-user', JSON.stringify(newUser));
    setUser(newUser);
    setIsAdmin(newUser.email === 'astrydeapp@gmail.com');
  };

  const logout = () => {
    localStorage.removeItem('astryde-user');
    setUser(null);
    setIsAdmin(false);
  };
  
  const updateVideoStatus = async (videoId: string, status: Video['status']) => {
    const newTechs = technologies.map(tech => ({
      ...tech,
      creators: tech.creators.map(creator => ({
        ...creator,
        videos: creator.videos.map(video => 
          video.id === videoId ? { ...video, status } : video
        )
      }))
    }));
    setTechnologies(processData(newTechs));
    updateLocalStorage(newTechs);
  };

  const addTechnology = async (tech: Omit<Technology, 'id' | 'creators' | 'icon'> & {iconName: string}) => {
    const newTechnology: Technology = {
        ...tech,
        id: `tech-${Date.now()}`,
        creators: [],
        icon: getIconComponent(tech.iconName),
    };
    const newTechs = [...technologies, newTechnology];
    setTechnologies(processData(newTechs));
    updateLocalStorage(newTechs);
  };

  const addCreator = async (techId: string, creator: Omit<Creator, 'id' | 'videos'>) => {
      const newCreator: Creator = {
          ...creator,
          id: `creator-${Date.now()}`,
          videos: []
      };
      const newTechs = technologies.map(tech => {
          if (tech.id === techId) {
              return { ...tech, creators: [...tech.creators, newCreator]};
          }
          return tech;
      });
      setTechnologies(processData(newTechs));
      updateLocalStorage(newTechs);
  };

  const addVideo = async (techId: string, creatorId: string, video: Omit<Video, 'id' | 'status'>) => {
      const newVideo: Video = {
          ...video,
          id: `video-${Date.now()}`,
          status: 'Not Started',
      };
      const newTechs = technologies.map(tech => {
          if (tech.id === techId) {
              return {
                  ...tech,
                  creators: tech.creators.map(creator => {
                      if (creator.id === creatorId) {
                          return { ...creator, videos: [...creator.videos, newVideo] };
                      }
                      return creator;
                  })
              }
          }
          return tech;
      });
      setTechnologies(processData(newTechs));
      updateLocalStorage(newTechs);
  };

  const deleteTechnology = async (techId: string) => {
    const newTechs = technologies.filter(tech => tech.id !== techId);
    setTechnologies(processData(newTechs));
    updateLocalStorage(newTechs);
  };

  const deleteCreator = async (techId: string, creatorId: string) => {
    const newTechs = technologies.map(tech => {
      if (tech.id === techId) {
        return { ...tech, creators: tech.creators.filter(c => c.id !== creatorId) };
      }
      return tech;
    });
    setTechnologies(processData(newTechs));
    updateLocalStorage(newTechs);
  };

  const deleteVideo = async (techId: string, creatorId: string, videoId: string) => {
    const newTechs = technologies.map(tech => {
      if (tech.id === techId) {
        return {
          ...tech,
          creators: tech.creators.map(creator => {
            if (creator.id === creatorId) {
              return { ...creator, videos: creator.videos.filter(v => v.id !== videoId) };
            }
            return creator;
          })
        };
      }
      return tech;
    });
    setTechnologies(processData(newTechs));
    updateLocalStorage(newTechs);
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

