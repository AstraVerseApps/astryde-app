
'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Circle, CheckCircle2, PlayCircle, Clock, ArrowLeft } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import type { Video, Technology, Creator } from '@/types';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

const statusIcons: Record<Video['status'], React.ReactNode> = {
  'Not Started': <Circle className="h-4 w-4 text-muted-foreground" />,
  'In Progress': <PlayCircle className="h-4 w-4 text-yellow-400" />,
  'Completed': <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

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

export default function DashboardPage() {
  const { updateVideoStatus, technologies } = useUser();
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null);
  const [selectedCreatorId, setSelectedCreatorId] = useState<string | null>(null);

  useEffect(() => {
    if (technologies.length > 0 && !selectedTechId) {
      setSelectedTechId(technologies[0].id);
    }
  }, [technologies, selectedTechId]);
  
  const selectedTech = technologies.find(t => t.id === selectedTechId);
  const creators = selectedTech?.creators || [];
  
  useEffect(() => {
    if (creators.length > 0 && !selectedCreatorId) {
        setSelectedCreatorId(creators[0].id);
    } else if (creators.length > 0 && selectedCreatorId) {
        const creatorExists = creators.some(c => c.id === selectedCreatorId);
        if (!creatorExists) {
            setSelectedCreatorId(creators[0].id);
        }
    } else if (creators.length === 0) {
        setSelectedCreatorId(null);
    }
  }, [creators, selectedCreatorId]);

  const selectedCreator = creators.find(c => c.id === selectedCreatorId);

  const handleStatusChange = (videoId: string, status: Video['status']) => {
    updateVideoStatus(videoId, status);
  };

  const handleTechChange = (techId: string) => {
    setSelectedTechId(techId);
    const newTech = technologies.find(t => t.id === techId);
    if (newTech && newTech.creators.length > 0) {
        setSelectedCreatorId(newTech.creators[0].id);
    } else {
        setSelectedCreatorId(null);
    }
  }

  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Your Learning Galaxy</h1>
      </div>
       <Card>
        <CardHeader>
          <CardTitle>Explore Technologies</CardTitle>
          <CardDescription>Select a technology to begin your journey through its universe of creators and content.</CardDescription>
        </CardHeader>
        <CardContent>
            {technologies.length > 0 ? (
                <Tabs value={selectedTechId || ''} onValueChange={handleTechChange} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
                        {technologies.map(tech => (
                            <TabsTrigger key={tech.id} value={tech.id}>{tech.name}</TabsTrigger>
                        ))}
                    </TabsList>
                    {technologies.map(tech => (
                        <TabsContent key={tech.id} value={tech.id}>
                           <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-1">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Creators in {tech.name}</CardTitle>
                                            <CardDescription>Select a creator to see their videos.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            {tech.creators.length > 0 ? tech.creators.map(creator => (
                                                <div 
                                                    key={creator.id}
                                                    onClick={() => setSelectedCreatorId(creator.id)}
                                                    className={cn(
                                                        "flex items-center gap-4 p-3 rounded-lg cursor-pointer transition-colors",
                                                        selectedCreatorId === creator.id ? "bg-primary/10 text-primary" : "hover:bg-muted/50"
                                                    )}
                                                >
                                                    <Avatar className="h-10 w-10 border-2 border-primary/20">
                                                        <AvatarImage src={creator.avatar} />
                                                        <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                                                    </Avatar>
                                                    <span className="font-medium">{creator.name}</span>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-muted-foreground p-3">No creators available for this technology yet.</p>
                                            )}
                                        </CardContent>
                                    </Card>
                                </div>
                                <div className="lg:col-span-2">
                                    {selectedCreator ? (
                                         <div className="space-y-4">
                                            {selectedCreator.videos.map(video => (
                                                <Dialog key={video.id}>
                                                    <Card className="flex flex-col md:flex-row items-center justify-between p-4 group transition-all hover:shadow-md hover:border-primary/50">
                                                        <div className="flex items-center gap-4 w-full">
                                                            <div className="text-muted-foreground">{statusIcons[video.status]}</div>
                                                            <div className="flex-grow">
                                                                <p className="font-semibold">{video.title}</p>
                                                                <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {video.duration}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-4 md:mt-0 w-full md:w-auto justify-end flex-shrink-0">
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
                                            ))}
                                        </div>
                                    ) : (
                                        <Card className="flex items-center justify-center h-full min-h-[200px]">
                                            <p className="text-muted-foreground">Select a creator to see their videos.</p>
                                        </Card>
                                    )}
                                </div>
                           </div>
                        </TabsContent>
                    ))}
                </Tabs>
            ) : (
                <div className="text-center text-muted-foreground py-12">
                    <p>Your learning galaxy is waiting to be explored.</p>
                    <p>No technologies have been added yet.</p>
                </div>
            )}
        </CardContent>
      </Card>
    </>
  );
}
