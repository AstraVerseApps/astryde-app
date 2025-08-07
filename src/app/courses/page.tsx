
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Circle, CheckCircle2, PlayCircle, Clock, ArrowLeft } from 'lucide-react';
import React, { useState, useMemo } from 'react';
import type { Video, Technology, Creator } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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

export default function CoursesPage() {
  const { updateVideoStatus, technologies } = useUser();
  
  const [view, setView] = useState<'technologies' | 'creators' | 'videos'>('technologies');
  const [selectedTech, setSelectedTech] = useState<Technology | null>(null);
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);


  const handleStatusChange = (videoId: string, status: Video['status']) => {
    if (selectedTech && selectedCreator) {
      updateVideoStatus(selectedTech.id, selectedCreator.id, videoId, status);
    }
  };

  const handleTechClick = (tech: Technology) => {
    setSelectedTech(tech);
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
          title: 'Chart Your Course',
          description: 'Each technology is a star system waiting to be explored. Select one to begin your cosmic journey.'
        };
      case 'creators':
        return {
          title: `Creators for ${selectedTech?.name}`,
          description: 'Choose a creator to explore their video content.'
        };
      case 'videos':
        return {
          title: `Videos by ${selectedCreator?.name}`,
          description: `All videos from ${selectedCreator?.name} on ${selectedTech?.name}.`
        };
      default:
        return { title: '', description: '' };
    }
  };
  const { title, description } = getHeader();
  
  const videoProgress = useMemo(() => {
    if (view !== 'videos' || !selectedCreator) {
      return null;
    }
    const currentTech = technologies.find(t => t.id === selectedTech?.id);
    const currentCreator = currentTech?.creators.find(c => c.id === selectedCreator?.id);
    if (!currentCreator) return null;

    const completed = currentCreator.videos.filter(v => v.status === 'Completed').length;
    const inProgress = currentCreator.videos.filter(v => v.status === 'In Progress').length;
    const notStarted = currentCreator.videos.filter(v => v.status === 'Not Started').length;
    return { completed, inProgress, notStarted };
  }, [view, selectedTech, selectedCreator, technologies]);

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
        <div>
            <h1 className="text-lg font-semibold md:text-2xl font-headline">{title}</h1>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {view === 'technologies' && (
         <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {technologies.length > 0 ? technologies.map((tech, index) => {
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
                        <CardDescription>{tech.description}</CardDescription>
                    </CardHeader>
                </Card>
            )}) : (
                <div className="col-span-full text-center text-muted-foreground py-12">
                    <p>Your learning galaxy is waiting to be explored.</p>
                    <p>No technologies have been added yet.</p>
                </div>
            )}
        </div>
      )}

      {view === 'creators' && selectedTech && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {selectedTech.creators.length > 0 ? selectedTech.creators.map(creator => (
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
                </Card>
            )) : (
                 <div className="col-span-full text-center text-muted-foreground py-12">
                    <p>No creators have been added for this technology yet.</p>
                </div>
            )}
        </div>
      )}

      {view === 'videos' && selectedCreator && selectedTech && (() => {
        const creator = technologies
            .find(t => t.id === selectedTech.id)
            ?.creators.find(c => c.id === selectedCreator.id);

        return (
            <div className="space-y-4">
            {videoProgress && (
                <Card>
                    <CardContent className="p-4 flex justify-around">
                        <div className="text-center">
                            <p className="text-2xl font-bold">{videoProgress.completed}</p>
                            <p className="text-sm text-muted-foreground">Completed</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{videoProgress.inProgress}</p>
                            <p className="text-sm text-muted-foreground">In Progress</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold">{videoProgress.notStarted}</p>
                            <p className="text-sm text-muted-foreground">Not Started</p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {creator && creator.videos.length > 0 ? creator.videos.map(video => (
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
                    <p>This creator hasn't added any videos for this technology yet.</p>
                </div>
            )}
            </div>
        )
      })()}
    </>
  );
}

    
