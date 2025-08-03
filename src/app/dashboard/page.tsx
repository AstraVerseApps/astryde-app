"use client";

import { technologies, allVideos } from "@/lib/data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from 'next/image';
import { Circle, CheckCircle2, PlayCircle, Clock } from 'lucide-react';
import React, { useState, useMemo } from "react";
import type { Video } from "@/types";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AiSuggestions } from "@/components/ai-suggestions";

const statusIcons: Record<Video['status'], React.ReactNode> = {
  'Not Started': <Circle className="h-4 w-4 text-muted-foreground" />,
  'In Progress': <PlayCircle className="h-4 w-4 text-yellow-400" />,
  'Completed': <CheckCircle2 className="h-4 w-4 text-green-500" />,
};

export default function DashboardPage() {
  const [videos, setVideos] = useState<Video[]>(allVideos);

  const handleStatusChange = (videoId: string, status: Video['status']) => {
    setVideos(currentVideos =>
      currentVideos.map(video =>
        video.id === videoId ? { ...video, status } : video
      )
    );
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
  }, [videos]);

  const getVideoById = (id: string) => videos.find(v => v.id === id);

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
              <Accordion type="single" collapsible className="w-full">
                {technologies.map((tech) => (
                  <AccordionItem value={tech.id} key={tech.id}>
                    <AccordionTrigger className="text-lg font-medium hover:no-underline">
                      <div className="flex items-center gap-3">
                        <tech.icon className="h-6 w-6 text-primary icon-glow" />
                        {tech.name}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pl-4">
                      {tech.creators.map((creator) => (
                        <div key={creator.id} className="mt-4">
                          <div className="flex items-center gap-3 mb-2">
                            <Avatar>
                              <AvatarImage src={creator.avatar} />
                              <AvatarFallback>{creator.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <h4 className="font-semibold">{creator.name}</h4>
                          </div>
                          <div className="border-l-2 border-primary/20 pl-6 ml-5">
                            {creator.videos.map((video) => {
                                const videoState = getVideoById(video.id);
                                return (
                                  <div key={video.id} className="flex items-center justify-between py-3 group">
                                    <div className="flex items-center gap-4">
                                      <div className="w-32 h-18 bg-muted rounded-md overflow-hidden shrink-0">
                                         <Image data-ai-hint="code technology" src={video.thumbnail} alt={video.title} width={128} height={72} className="object-cover w-full h-full"/>
                                      </div>
                                      <div>
                                        <p className="font-medium">{video.title}</p>
                                        <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {video.duration}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="hidden md:block">
                                            {statusIcons[videoState?.status ?? 'Not Started']}
                                        </div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">Set Status</Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent>
                                                <DropdownMenuItem onClick={() => handleStatusChange(video.id, 'Not Started')}>Not Started</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(video.id, 'In Progress')}>In Progress</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(video.id, 'Completed')}>Completed</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                  </div>
                                );
                            })}
                          </div>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="ai-suggestions">
            <AiSuggestions
                completedCourses={completedCourses}
                subjectsOfInterest={subjectsOfInterest}
                allVideos={videos}
             />
        </TabsContent>
      </Tabs>
    </>
  );
}
