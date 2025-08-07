
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, ArrowLeft, PlayCircle } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import type { Video, Technology, Creator } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
        const urlObj = new URL(url);
        const videoId = urlObj.searchParams.get('v');
        return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    } catch (error) {
        console.error('Invalid YouTube URL:', error);
        return '';
    }
};

const cardColors = [
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
];

export default function ProgressPage() {
  const { updateVideoStatus, technologies } = useUser();
  
  const [view, setView] = useState<'technologies' | 'creators' | 'videos'>('technologies');
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);

  const inProgressTechnologies = useMemo(() => {
    return technologies
      .map(tech => ({
        ...tech,
        creators: tech.creators
          .map(creator => ({
            ...creator,
            videos: creator.videos.filter(video => video.status === 'In Progress'),
          }))
          .filter(creator => creator.videos.length > 0),
      }))
      .filter(tech => tech.creators.length > 0);
  }, [technologies]);

  const handleStatusChange = (videoId: string, status: Video['status']) => {
    if (selectedTech && selectedCreator) {
      updateVideoStatus(selectedTech.id, selectedCreator.id, videoId, status);
    }
  };

  const handleTechClick = (tech: Technology) => {
    // We need to use the full tech object from the original `technologies` array
    const fullTech = technologies.find(t => t.id === tech.id);
    setSelectedTech(fullTech || tech);
    setView('creators');
  }

  const handleCreatorClick = (creator: Creator) => {
    setSelectedCreator(creator);
    setView('videos');
  }

  const handleBack = () => {
    if (view === 'videos') {
      setView('creators');
      setSelectedCreator(null);
    } else if (view === 'creators') {
      setView('technologies');
      setSelectedTech(null);
    }
  }

  const getHeader = () => {
    switch (view) {
      case 'technologies':
        return {
          title: 'Your Learning Progress',
          description: 'A focused view of technologies where you have videos in progress.'
        };
      case 'creators':
        return {
          title: `In Progress with ${selectedTech?.name}`,
          description: 'Creators you are actively learning from for this technology.'
        };
      case 'videos':
        return {
          title: `Continuing with ${selectedCreator?.name}`,
          description: `All videos from ${selectedCreator?.name} on ${selectedTech?.name}.`
        };
      default:
        return { title: '', description: '' };
    }
  };
  const { title, description } = getHeader();
  
  const statusStyles: Record<Video['status'], string> = {
    'Completed': 'bg-green-500/10 border-green-500/50 hover:bg-green-500/20',
    'In Progress': 'bg-yellow-500/10 border-yellow-500/50 hover:bg-yellow-500/20',
    'Not Started': '',
  };


  return (
    <>
      <div className="flex items-center mb-6">
        {view !== 'technologies' && (
          <Button variant="ghost" size="icon" onClick={handleBack} className="mr-4">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <div className="flex-grow">
            <h1 className="text-lg font-semibold md:text-2xl font-headline">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {view === 'technologies' && (
         <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {inProgressTechnologies.length > 0 ? inProgressTechnologies.map((tech, index) => {
              const colorVar = cardColors[index % cardColors.length];
              return (
                <Card 
                    key={tech.id} 
                    onClick={() => handleTechClick(tech)}
                    className="cursor-pointer transition-all hover:-translate-y-1 border-b-4"
                    style={{ 
                      borderColor: `hsl(var(${colorVar}))`,
                      boxShadow: `0 0 20px hsl(var(${colorVar}) / 0.1)`
                    }}
                >
                    <CardHeader>
                        <CardTitle>{tech.name}</CardTitle>
                        <CardDescription>{tech.creators.length} creator(s) in progress</CardDescription>
                    </CardHeader>
                </Card>
            )}) : (
                <div className="col-span-full text-center text-muted-foreground py-12">
                    <p>No courses in progress.</p>
                    <p>Go to the main 'Courses' page to start learning!</p>
                </div>
            )}
        </div>
      )}

      {view === 'creators' && selectedTech && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {selectedTech.creators.map(creator => (
                <Card 
                    key={creator.id}
                    onClick={() => handleCreatorClick(creator)}
                    className="flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all hover:shadow-primary/20 hover:shadow-lg hover:-translate-y-1"
                >
                    <Avatar className="w-24 h-24 mb-4 border-4 border-muted">
                        <AvatarImage src={creator.avatar} />
                        <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <h3 className="text-lg font-bold">{creator.name}</h3>
                     <p className="text-sm text-muted-foreground">{creator.videos.length} video(s) in progress</p>
                </Card>
            ))}
        </div>
      )}

      {view === 'videos' && selectedCreator && selectedTech && (() => {
        // Find the full creator object from the original `technologies` state
        // to ensure we have all videos, not just the filtered "In Progress" ones.
        const fullCreator = technologies
            .find(t => t.id === selectedTech.id)
            ?.creators.find(c => c.id === selectedCreator.id);
        
        return (
          <div className="space-y-4">
            {fullCreator && fullCreator.videos.length > 0 ? fullCreator.videos.map(video => (
                <Dialog key={video.id}>
                    <Card className={cn(
                        "flex flex-col md:flex-row items-center justify-between p-4 group transition-all",
                        statusStyles[video.status]
                    )}>
                        <div className="flex items-center gap-4 w-full">
                            <div className="flex-grow">
                                <p className="font-semibold">{video.title}</p>
                                <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {video.duration}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto justify-end flex-shrink-0">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        {video.status}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleStatusChange(video.id, 'Not Started')}>Not Started</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(video.id, 'In Progress')}>In Progress</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleStatusChange(video.id, 'Completed')}>Completed</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                            <DialogTrigger asChild>
                                <Button size="sm">
                                    <PlayCircle className="mr-2 h-4 w-4" />
                                    Watch Now
                                 </Button>
                            </DialogTrigger>
                        </div>
                    </Card>
                     <DialogContent className="max-w-4xl h-auto">
                        <DialogHeader>
                            <DialogTitle>{video.title}</DialogTitle>
                        </DialogHeader>
                        <div className="aspect-video">
                            <iframe
                                className="w-full h-full rounded-lg"
                                src={getYouTubeEmbedUrl(video.url)}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </DialogContent>
                </Dialog>
            )) : (
                 <div className="text-center text-muted-foreground py-12">
                    <p>No videos available for this creator.</p>
                </div>
            )}
            </div>
      )})()}
    </>
  );
}
