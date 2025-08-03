
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, UploadCloud } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { technologies } from '@/lib/data';
import type { Creator } from '@/types';

export default function AdminPage() {
  const [selectedTech, setSelectedTech] = React.useState<string>('');
  const [creatorsForTech, setCreatorsForTech] = React.useState<Creator[]>([]);

  const handleTechChangeForCreator = (techId: string) => {
    // In a real app, you'd probably fetch this, but for now we filter
    const tech = technologies.find(t => t.id === techId);
    setCreatorsForTech(tech ? tech.creators : []);
  };


  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Admin Control Panel</h1>
      </div>

      <div className="grid gap-8 md:grid-cols-1">
        {/* Add New Technology */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Technology</CardTitle>
            <CardDescription>Add a new technology category to the learning galaxy.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tech-name">Technology Name</Label>
              <Input id="tech-name" placeholder="e.g. Quantum Computing" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="tech-desc">Description</Label>
              <Input id="tech-desc" placeholder="A brief summary of the technology" />
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Technology
            </Button>
          </CardContent>
        </Card>

        {/* Add New Creator */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Creator</CardTitle>
            <CardDescription>Add a new content creator and assign them to a technology.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="tech-select-creator">Technology</Label>
                <Select>
                    <SelectTrigger id="tech-select-creator">
                        <SelectValue placeholder="Select a technology" />
                    </SelectTrigger>
                    <SelectContent>
                        {technologies.map(tech => (
                            <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
             <div className="space-y-2">
              <Label htmlFor="creator-name">Creator Name</Label>
              <Input id="creator-name" placeholder="e.g. Dr. Nova" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="creator-avatar">Avatar URL</Label>
                <Input id="creator-avatar" placeholder="https://placehold.co/100x100" />
            </div>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Creator
            </Button>
          </CardContent>
        </Card>
        
        {/* Add New Video */}
        <Card>
            <CardHeader>
                <CardTitle>Add New Video</CardTitle>
                <CardDescription>Add a new video from a creator to a specific technology.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="tech-select-video">Technology</Label>
                        <Select onValueChange={handleTechChangeForCreator}>
                            <SelectTrigger id="tech-select-video">
                                <SelectValue placeholder="Select a technology" />
                            </SelectTrigger>
                            <SelectContent>
                                {technologies.map(tech => (
                                    <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="creator-select-video">Creator</Label>
                        <Select>
                            <SelectTrigger id="creator-select-video">
                                <SelectValue placeholder="Select a creator" />
                            </SelectTrigger>
                            <SelectContent>
                                {creatorsForTech.map(creator => (
                                     <SelectItem key={creator.id} value={creator.id}>{creator.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="video-title">Video Title</Label>
                    <Input id="video-title" placeholder="e.g. Introduction to Warp Drives" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="video-duration">Duration</Label>
                    <Input id="video-duration" placeholder="e.g. 42:10" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="video-thumbnail">Thumbnail URL</Label>
                    <Input id="video-thumbnail" placeholder="https://placehold.co/1280x720" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="video-url">YouTube Video URL</Label>
                    <Input id="video-url" placeholder="https://www.youtube.com/watch?v=..." />
                </div>
                <Button>
                    <UploadCloud className="mr-2 h-4 w-4" />
                    Add Video
                </Button>
            </CardContent>
        </Card>
      </div>
    </>
  );
}
