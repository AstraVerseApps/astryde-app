import type { LucideIcon } from 'lucide-react';

export type Video = {
  id: string;
  title: string;
  duration: string;
  thumbnail: string;
  url: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
  creator?: string;
  technology?: string;
};

export type Creator = {
  id: string;
  name: string;
  avatar: string;
  videos: Video[];
};

export type Technology = {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon | ((props: React.SVGProps<SVGSVGElement>) => JSX.Element);
  creators: Creator[];
};
