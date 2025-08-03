
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Video } from '@/types';
import { allVideos } from '@/lib/data';

interface User {
  email: string;
}

interface UserContextType {
  user: User | null;
  isAdmin: boolean;
  videos: Video[];
  allVideosForUser: Video[];
  login: (email: string) => void;
  logout: () => void;
  updateVideoStatus: (videoId: string, status: Video['status']) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [videos, setVideos] = useState<Video[]>(allVideos);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);
      login(parsedUser.email);
    }
  }, []);

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
      setVideos(allVideos);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    setVideos(allVideos);
    sessionStorage.removeItem('user');
  };

  const updateVideoStatus = (videoId: string, status: Video['status']) => {
    const newVideos = videos.map(video =>
      video.id === videoId ? { ...video, status } : video
    );
    setVideos(newVideos);
    if (user) {
      sessionStorage.setItem(`video-progress-${user.email}`, JSON.stringify(newVideos));
    }
  };

  return (
    <UserContext.Provider value={{ user, isAdmin, videos, allVideosForUser: videos, login, logout, updateVideoStatus }}>
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
