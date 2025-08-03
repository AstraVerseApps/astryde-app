
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Video, Technology, Creator } from '@/types';
import { technologies as initialTechnologies, allVideos as initialAllVideos } from '@/lib/data';
import { BrainCircuit } from 'lucide-react';

interface User {
  email: string;
}

interface UserContextType {
  user: User | null;
  isAdmin: boolean;
  videos: Video[];
  allVideosForUser: Video[];
  technologies: Technology[];
  login: (email: string) => void;
  logout: () => void;
  updateVideoStatus: (videoId: string, status: Video['status']) => void;
  addTechnology: (tech: Omit<Technology, 'id' | 'creators' | 'icon'>) => void;
  addCreator: (techId: string, creator: Omit<Creator, 'id' | 'videos'>) => void;
  addVideo: (techId: string, creatorId: string, video: Omit<Video, 'id' | 'status'>) => void;
  deleteTechnology: (techId: string) => void;
  deleteCreator: (techId: string, creatorId: string) => void;
  deleteVideo: (techId: string, creatorId: string, videoId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [videos, setVideos] = useState<Video[]>(initialAllVideos);
  const [technologies, setTechnologies] = useState<Technology[]>(initialTechnologies);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      login(parsedUser.email);
    }
  }, []);
  
  useEffect(() => {
    if (user) {
        const storedTech = sessionStorage.getItem(`technologies-${user.email}`);
        if(storedTech) {
            setTechnologies(JSON.parse(storedTech));
        } else {
            setTechnologies(initialTechnologies);
        }
    }
  }, [user]);

  const login = (email: string) => {
    const newUser = { email };
    setUser(newUser);
    sessionStorage.setItem('user', JSON.stringify(newUser));

    if (email === 'astrydeapp@gmail.com') {
      setIsAdmin(true);
    } else {
      setIsAdmin(false);
    }

    const storedVideos = sessionStorage.getItem(`video-progress-${email}`);
    if (storedVideos) {
      setVideos(JSON.parse(storedVideos));
    } else {
      setVideos(initialTechnologies.flatMap(tech => tech.creators.flatMap(c => c.videos)));
    }

    const storedTech = sessionStorage.getItem(`technologies-${email}`);
    if(storedTech) {
        setTechnologies(JSON.parse(storedTech));
    } else {
        setTechnologies(initialTechnologies);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setVideos(initialAllVideos);
    setTechnologies(initialTechnologies);
    sessionStorage.removeItem('user');
  };

  const updateVideoStatus = (videoId: string, status: Video['status']) => {
    const newVideos = videos.map(video =>
      video.id === videoId ? { ...video, status } : video
    );
    setVideos(newVideos);

    const newTechnologies = technologies.map(tech => ({
        ...tech,
        creators: tech.creators.map(creator => ({
            ...creator,
            videos: creator.videos.map(video => 
                video.id === videoId ? { ...video, status } : video
            )
        }))
    }));
    setTechnologies(newTechnologies);

    if (user) {
      sessionStorage.setItem(`video-progress-${user.email}`, JSON.stringify(newVideos));
      sessionStorage.setItem(`technologies-${user.email}`, JSON.stringify(newTechnologies));
    }
  };

  const addTechnology = (tech: Omit<Technology, 'id' | 'creators' | 'icon'>) => {
    const newTechnology: Technology = {
        ...tech,
        id: `tech-${Date.now()}`,
        icon: BrainCircuit, // Default icon
        creators: [],
    };
    const newTechnologies = [...technologies, newTechnology];
    setTechnologies(newTechnologies);
    if (user) {
        sessionStorage.setItem(`technologies-${user.email}`, JSON.stringify(newTechnologies));
    }
  };

  const addCreator = (techId: string, creator: Omit<Creator, 'id' | 'videos'>) => {
      const newCreator: Creator = {
          ...creator,
          id: `creator-${Date.now()}`,
          videos: [],
      };
      const newTechnologies = technologies.map(tech => 
          tech.id === techId ? { ...tech, creators: [...tech.creators, newCreator] } : tech
      );
      setTechnologies(newTechnologies);
      if (user) {
          sessionStorage.setItem(`technologies-${user.email}`, JSON.stringify(newTechnologies));
      }
  };

  const addVideo = (techId: string, creatorId: string, video: Omit<Video, 'id' | 'status'>) => {
      const newVideo: Video = {
          ...video,
          id: `video-${Date.now()}`,
          status: 'Not Started',
      };
      const newTechnologies = technologies.map(tech => 
          tech.id === techId ? {
              ...tech,
              creators: tech.creators.map(creator => 
                  creator.id === creatorId ? { ...creator, videos: [...creator.videos, newVideo] } : creator
              )
          } : tech
      );
      setTechnologies(newTechnologies);
      if (user) {
          sessionStorage.setItem(`technologies-${user.email}`, JSON.stringify(newTechnologies));
      }
  };

  const deleteTechnology = (techId: string) => {
    const newTechnologies = technologies.filter(tech => tech.id !== techId);
    setTechnologies(newTechnologies);
    if(user) {
        sessionStorage.setItem(`technologies-${user.email}`, JSON.stringify(newTechnologies));
    }
  };

  const deleteCreator = (techId: string, creatorId: string) => {
    const newTechnologies = technologies.map(tech => {
        if(tech.id === techId) {
            return {
                ...tech,
                creators: tech.creators.filter(c => c.id !== creatorId)
            }
        }
        return tech;
    });
    setTechnologies(newTechnologies);
    if(user) {
        sessionStorage.setItem(`technologies-${user.email}`, JSON.stringify(newTechnologies));
    }
  };

  const deleteVideo = (techId: string, creatorId: string, videoId: string) => {
    const newTechnologies = technologies.map(tech => {
        if(tech.id === techId) {
            return {
                ...tech,
                creators: tech.creators.map(creator => {
                    if(creator.id === creatorId) {
                        return {
                            ...creator,
                            videos: creator.videos.filter(v => v.id !== videoId)
                        }
                    }
                    return creator;
                })
            }
        }
        return tech;
    });
    setTechnologies(newTechnologies);
    if(user) {
        sessionStorage.setItem(`technologies-${user.email}`, JSON.stringify(newTechnologies));
    }
  };

  const allVideosForUser = technologies.flatMap(tech => 
    tech.creators.flatMap(c => c.videos.map(v => ({...v, creator: c.name, technology: tech.name})))
  );


  return (
    <UserContext.Provider value={{ 
        user, 
        isAdmin, 
        videos, 
        allVideosForUser, 
        technologies,
        login, 
        logout, 
        updateVideoStatus,
        addTechnology,
        addCreator,
        addVideo,
        deleteTechnology,
        deleteCreator,
        deleteVideo
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
