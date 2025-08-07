
import type { LucideIcon } from 'lucide-react';
import type { Timestamp } from 'firebase/firestore';

export type Video = {
  id: string;
  title: string;
  duration: string;
  url: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
  creator?: string;
  technology?: string;
  createdAt?: Timestamp;
  completedAt?: Timestamp;
};

export type Creator = {
  id: string;
  name: string;
  avatar: string;
  videos: Video[];
  isStarred?: boolean;
};

export type Technology = {
  id:string;
  name: string;
  description: string;
  creators: Creator[];
};
