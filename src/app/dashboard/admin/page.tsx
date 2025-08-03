
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, UploadCloud, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { technologies } from '@/lib/data';
import type { Creator, Video } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

export default function AdminPage() {
  const [creatorsForTech, setCreatorsForTech] = React.useState<Creator[]>([]);
  const [videosForCreator, setVideosForCreator] = React.useState<Video[]>([]);
  const [selectedTechForCreator, setSelectedTechForCreator] = React.useState<string>('');

  const handleTechChangeForCreator = (techId: string) => {
    setSelectedTechForCreator(techId);
    const tech = technologies.find(t => t.id === techId);
    setCreatorsForTech(tech ? tech.creators : []);
    setVideosForCreator([]);
  };

  const handleCreatorChangeForVideo = (creatorId: string) => {
    const tech = technologies.find(t => t.id === selectedTechForCreator);
    const creator = tech?.creators.find(c => c.id === creatorId);
    setVideosForCreator(creator ? creator.videos : []);
  }

  return (
    <>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Admin Control Panel</h1>
      </div>

      <div className="grid gap-8">
        {/* Add Section */}
        <Card>
            <CardHeader>
                <CardTitle>Add Content</CardTitle>
                <CardDescription>Expand the learning galaxy with new topics, creators, and videos.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                {/* Add Technology Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Add New Technology</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                        <div className="space-y-2">
                            <Label htmlFor="tech-name">Technology Name</Label>
                            <Input id="tech-name" placeholder="e.g. Quantum Computing" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tech-desc">Description</Label>
                            <Input id="tech-desc" placeholder="A brief summary" />
                        </div>
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Technology
                        </Button>
                    </div>
                </Card>

                {/* Add Creator Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Add New Creator</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
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
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button className="w-full">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Creator
                        </Button>
                    </div>
                </Card>

                {/* Add Video Card */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle className="text-lg">Add New Video</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tech-select-video-add">Technology</Label>
                                <Select onValueChange={handleTechChangeForCreator}>
                                    <SelectTrigger id="tech-select-video-add">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {technologies.map(tech => (
                                            <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="creator-select-video-add">Creator</Label>
                                <Select disabled={creatorsForTech.length === 0}>
                                    <SelectTrigger id="creator-select-video-add">
                                        <SelectValue placeholder="Select" />
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
                            <Input id="video-title" placeholder="e.g. Intro to Warp Drives" />
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
                    </CardContent>
                     <div className="p-6 pt-0">
                        <Button className="w-full">
                            <UploadCloud className="mr-2 h-4 w-4" />
                            Add Video
                        </Button>
                    </div>
                </Card>
            </CardContent>
        </Card>

        {/* Delete Section */}
        <Card>
            <CardHeader>
                <CardTitle>Delete Content</CardTitle>
                <CardDescription>Permanently remove technologies, creators, or videos from the platform.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-8 md:grid-cols-1 lg:grid-cols-3">
                {/* Delete Technology */}
                 <Card className="flex flex-col border-destructive">
                    <CardHeader>
                        <CardTitle className="text-lg text-destructive">Delete Technology</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                         <div className="space-y-2">
                            <Label htmlFor="tech-select-delete">Technology</Label>
                            <Select>
                                <SelectTrigger id="tech-select-delete" className="border-destructive focus:ring-destructive">
                                    <SelectValue placeholder="Select a technology to delete" />
                                </SelectTrigger>
                                <SelectContent>
                                    {technologies.map(tech => (
                                        <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <p className="text-sm text-muted-foreground">WARNING: Deleting a technology will also delete all associated creators and videos.</p>
                    </CardContent>
                    <div className="p-6 pt-0">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Technology
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the technology and all of its content.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </Card>

                {/* Delete Creator */}
                <Card className="flex flex-col border-destructive">
                    <CardHeader>
                        <CardTitle className="text-lg text-destructive">Delete Creator</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                        <div className="space-y-2">
                            <Label htmlFor="tech-select-creator-delete">Technology</Label>
                            <Select onValueChange={handleTechChangeForCreator}>
                                <SelectTrigger id="tech-select-creator-delete" className="border-destructive focus:ring-destructive">
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
                            <Label htmlFor="creator-select-delete">Creator</Label>
                            <Select disabled={creatorsForTech.length === 0}>
                                <SelectTrigger id="creator-select-delete" className="border-destructive focus:ring-destructive">
                                    <SelectValue placeholder="Select a creator to delete" />
                                </SelectTrigger>
                                <SelectContent>
                                    {creatorsForTech.map(creator => (
                                        <SelectItem key={creator.id} value={creator.id}>{creator.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <div className="p-6 pt-0">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Creator
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the creator and all of their videos.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </Card>

                {/* Delete Video */}
                <Card className="flex flex-col border-destructive">
                    <CardHeader>
                        <CardTitle className="text-lg text-destructive">Delete Video</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-grow">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="tech-select-video-delete">Technology</Label>
                                <Select onValueChange={handleTechChangeForCreator}>
                                    <SelectTrigger id="tech-select-video-delete" className="border-destructive focus:ring-destructive">
                                        <SelectValue placeholder="Select" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {technologies.map(tech => (
                                            <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="creator-select-video-delete">Creator</Label>
                                <Select disabled={creatorsForTech.length === 0} onValueChange={handleCreatorChangeForVideo}>
                                    <SelectTrigger id="creator-select-video-delete" className="border-destructive focus:ring-destructive">
                                        <SelectValue placeholder="Select" />
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
                            <Label htmlFor="video-select-delete">Video</Label>
                            <Select disabled={videosForCreator.length === 0}>
                                <SelectTrigger id="video-select-delete" className="border-destructive focus:ring-destructive">
                                    <SelectValue placeholder="Select a video to delete" />
                                </SelectTrigger>
                                <SelectContent>
                                    {videosForCreator.map(video => (
                                        <SelectItem key={video.id} value={video.id}>{video.title}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                     <div className="p-6 pt-0">
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Video
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the video.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction>Continue</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </Card>
            </CardContent>
        </Card>
      </div>
    </>
  );
}

    