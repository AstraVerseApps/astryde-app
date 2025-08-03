
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Image from 'next/image';
import { Circle, CheckCircle2, PlayCircle, Clock, ArrowLeft } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import type { Video, Technology, Creator } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { AiSuggestions } from '@/components/ai-suggestions';
import { useUser } from '@/context/UserContext';

const statusIcons: Record<Video['status'], React.ReactNode> = {
  'Not Started': <Circle className="h-4 w-4 text-muted-foreground" />,
  'In Progress': <PlayCircle className="h-4 w-4 text-yellow-400" />,
  'Completed': <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

export default function DashboardPage() {
  const { videos, updateVideoStatus, allVideosForUser, technologies } = useUser();
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const handleStatusChange = (videoId: string, status: Video['status']) => {
    updateVideoStatus(videoId, status);
  };

  const completedCourses = useMemo(() => videos.filter(v => v.status === 'Completed').map(v => v.id), [videos]);
  const subjectsOfInterest = useMemo(() => {
    const interestedVideoIds = videos
      .filter(v => v.status === 'Completed' || v.status === 'In Progress')
      .map(v => v.id);
    const subjects = new Set<string>();
    technologies.forEach(tech => {
      tech.creators.forEach(creator => {
        creator.videos.forEach(video => {
          if (interestedVideoIds.includes(video.id)) {
            subjects.add(tech.name);
          }
        });
      });
    });
    return Array.from(subjects);
  }, [videos, technologies]);

  const getVideoById = (id: string): Video | undefined => {
    for (const tech of technologies) {
      for (const creator of tech.creators) {
        const video = creator.videos.find(v => v.id === id);
        if (video) return video;
      }
    }
    return undefined;
  };
  
  const renderVideoList = () => {
    if (!selectedTech || !selectedCreator) return null;

    const creatorVideos = selectedCreator.videos;

    return (
      <div>
        <Button variant="ghost" onClick={() => setSelectedCreator(null)} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Creators
        </Button>
        <div className="flex items-center gap-4 mb-6">
            <Avatar className="h-16 w-16">
              <AvatarImage src={selectedCreator.avatar} />
              <AvatarFallback>{selectedCreator.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
                <h2 className="text-2xl font-bold font-headline">{selectedCreator.name}</h2>
                <p className="text-muted-foreground">Videos on {selectedTech.name}</p>
            </div>
        </div>
        <div className="space-y-4">
          {creatorVideos.map((video) => (
            <Card key={video.id} className="flex items-center justify-between p-4 group">
              <div className="flex items-center gap-4">
                <div className="w-40 h-24 bg-muted rounded-md overflow-hidden shrink-0">
                  <Image data-ai-hint="code technology" src={video.thumbnail} alt={video.title} width={160} height={90} className="object-cover w-full h-full" />
                </div>
                <div>
                  <p className="font-semibold text-lg">{video.title}</p>
                  <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {video.duration}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden md:block">
                  {statusIcons[video.status]}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">Set Status</Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleStatusChange(video.id, 'Not Started')}>Not Started</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(video.id, 'In Progress')}>In Progress</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(video.id, 'Completed')}>Completed</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderCreatorGrid = () => {
    if (!selectedTech) return null;
    return (
      <div>
        <Button variant="ghost" onClick={() => {
          setSelectedTech(null);
          setSelectedCreator(null);
        }} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Technologies
        </Button>
        <div className="flex items-center gap-4 mb-6">
            <selectedTech.icon className="h-10 w-10 text-primary icon-glow" />
            <h2 className="text-3xl font-bold font-headline">{selectedTech.name}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {selectedTech.creators.map(creator => (
            <Card key={creator.id} className="cursor-pointer hover:shadow-lg hover:border-primary transition-all" onClick={() => setSelectedCreator(creator)}>
              <CardHeader className="items-center text-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src={creator.avatar} />
                    <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                <CardTitle>{creator.name}</CardTitle>
                <CardDescription>{creator.videos.length} videos</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderTechnologyGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
      {technologies.map(tech => (
        <Card key={tech.id} className="cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-transform duration-300" onClick={() => setSelectedTech(tech)}>
          <CardHeader>
            <div className="flex items-center gap-4 mb-2">
                <tech.icon className="h-10 w-10 text-primary icon-glow" />
                <CardTitle className="text-2xl font-headline">{tech.name}</CardTitle>
            </div>
            <CardDescription>{tech.description}</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="flex -space-x-4 rtl:space-x-reverse">
                {tech.creators.slice(0, 3).map(creator => (
                    <Avatar key={creator.id} className="border-2 border-background">
                        <AvatarImage src={creator.avatar} />
                        <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                ))}
                {tech.creators.length > 3 && (
                     <a className="flex items-center justify-center w-10 h-10 text-xs font-medium text-white bg-gray-700 border-2 border-white rounded-full hover:bg-gray-600 dark:border-gray-800" href="#">+{tech.creators.length - 3}</a>
                )}
             </div>
             <p className="text-sm text-muted-foreground mt-2">{tech.creators.length} creators</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
  
  const renderLearningPath = () => {
    if (selectedTech && selectedCreator) {
        return renderVideoList();
    }
    if (selectedTech) {
        return renderCreatorGrid();
    }
    return renderTechnologyGrid();
  }


  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Cosmic Dashboard</h1>
      </div>
      <Tabs defaultValue="learning-path" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
          <TabsTrigger value="ai-suggestions">AI Suggestions</TabsTrigger>
        </TabsList>
        <TabsContent value="learning-path">
          <Card>
            <CardHeader>
              <CardTitle>Your Learning Galaxy</CardTitle>
              <CardDescription>Explore technologies, creators, and videos to expand your universe of knowledge.</CardDescription>
            </CardHeader>
            <CardContent>
                {renderLearningPath()}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai-suggestions">
          <AiSuggestions
            completedCourses={completedCourses}
            subjectsOfInterest={subjectsOfInterest}
            allVideos={allVideosForUser}
          />
        </TabsContent>
      </Tabs>
    </>
  );
}
