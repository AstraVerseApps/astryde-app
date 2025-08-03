import type { Technology } from '@/types';
import { AppWindow, Cloud, Database, BrainCircuit } from 'lucide-react';

AppWindow.displayName = 'AppWindow';
Cloud.displayName = 'Cloud';
Database.displayName = 'Database';
BrainCircuit.displayName = 'BrainCircuit';

export const technologies: Technology[] = [
  {
    id: 'frontend',
    name: 'Frontend',
    description: 'Build beautiful and responsive user interfaces.',
    icon: AppWindow,
    creators: [
      {
        id: 'creator-1',
        name: 'Cosmic Coder',
        avatar: 'https://placehold.co/100x100/1E3A8A/FFFFFF',
        videos: [
          { id: 'v1', title: 'Galactic HTML & CSS', duration: '45:12', thumbnail: 'https://placehold.co/1280x720/BFDBFE/1E3A8A', status: 'Not Started' },
          { id: 'v2', title: 'JavaScript Starship', duration: '1:12:30', thumbnail: 'https://placehold.co/1280x720/BFDBFE/1E3A8A', status: 'Not Started' },
          { id: 'v3', title: 'React Nebulas', duration: '2:30:00', thumbnail: 'https://placehold.co/1280x720/BFDBFE/1E3A8A', status: 'In Progress' },
        ],
      },
      {
        id: 'creator-2',
        name: 'Astro Animator',
        avatar: 'https://placehold.co/100x100/1E3A8A/FFFFFF',
        videos: [
          { id: 'v4', title: 'Stellar CSS Animations', duration: '55:45', thumbnail: 'https://placehold.co/1280x720/BFDBFE/1E3A8A', status: 'Not Started' },
          { id: 'v5', title: 'Next.js Universe', duration: '1:45:10', thumbnail: 'https://placehold.co/1280x720/BFDBFE/1E3A8A', status: 'Completed' },
        ],
      },
    ],
  },
  {
    id: 'backend',
    name: 'Backend',
    description: 'Power your applications with robust server-side logic.',
    icon: Database,
    creators: [
      {
        id: 'creator-3',
        name: 'Galaxy Engineer',
        avatar: 'https://placehold.co/100x100/1E3A8A/FFFFFF',
        videos: [
          { id: 'v6', title: 'Node.js Black Holes', duration: '1:02:15', thumbnail: 'https://placehold.co/1280x720/BFDBFE/1E3A8A', status: 'Not Started' },
          { id: 'v7', title: 'Orbital Databases with SQL', duration: '1:30:40', thumbnail: 'https://placehold.co/1280x720/BFDBFE/1E3A8A', status: 'In Progress' },
        ],
      },
    ],
  },
  {
    id: 'devops',
    name: 'DevOps',
    description: 'Automate deployment and scale your infrastructure.',
    icon: Cloud,
    creators: [
      {
        id: 'creator-4',
        name: 'Captain Container',
        avatar: 'https://placehold.co/100x100/1E3A8A/FFFFFF',
        videos: [
          { id: 'v8', title: 'Docker: Shipping Containers to Mars', duration: '48:50', thumbnail: 'https://placehold.co/1280x720/BFDBFE/1E3A8A', status: 'Completed' },
          { id: 'v9', title: 'Kubernetes Constellations', duration: '2:15:00', thumbnail: 'https://placehold.co/1280x720/BFDBFE/1E3A8A', status: 'Not Started' },
        ],
      },
    ],
  },
  {
    id: 'ai-ml',
    name: 'AI/ML',
    description: 'Explore the universe of artificial intelligence.',
    icon: BrainCircuit,
    creators: [
      {
        id: 'creator-5',
        name: 'Dr. Nebula',
        avatar: 'https://placehold.co/100x100/1E3A8A/FFFFFF',
        videos: [
          { id: 'v10', title: 'Python for Space Cadets', duration: '1:10:20', thumbnail: 'https://placehold.co/1280x720/BFDBFE/1E3A8A', status: 'Completed' },
          { id: 'v11', title: 'TensorFlow: A New Dimension', duration: '2:45:30', thumbnail: 'https://placehold.co/1280x720/BFDBFE/1E3A8A', status: 'Not Started' },
          { id: 'v12', title: 'The Ethics of Alien AI', duration: '35:00', thumbnail: 'https://placehold.co/1280x720/BFDBFE/1E3A8A', status: 'Not Started' },
        ],
      },
    ],
  },
];

export const allVideos = technologies.flatMap(tech => tech.creators.flatMap(c => c.videos.map(v => ({...v, creator: c.name, technology: tech.name}))));
