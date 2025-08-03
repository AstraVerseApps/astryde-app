
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
  
  const [deleteType, setDeleteType] = React.useState<'technology' | 'creator' | 'video' | ''>('');
  const [deleteTech, setDeleteTech] = React.useState<string>('');
  const [deleteCreator, setDeleteCreator] = React.useState<string>('');

  const handleTechChange = (techId: string) => {
    setSelectedTechForCreator(techId);
    const tech = technologies.find(t => t.id === techId);
    setCreatorsForTech(tech ? tech.creators : []);
    setVideosForCreator([]);
  };

  const handleCreatorChange = (creatorId: string) => {
    const tech = technologies.find(t => t.id === selectedTechForCreator);
    const creator = tech?.creators.find(c => c.id === creatorId);
    setVideosForCreator(creator ? creator.videos : []);
  }

  const handleTechChangeForDelete = (techId: string) => {
    setDeleteTech(techId);
    setDeleteCreator('');
    const tech = technologies.find(t => t.id === techId);
    setCreatorsForTech(tech ? tech.creators : []);
    setVideosForCreator([]);
  };

  const handleCreatorChangeForDelete = (creatorId: string) => {
    setDeleteCreator(creatorId);
    const tech = technologies.find(t => t.id === deleteTech);
    const creator = tech?.creators.find(c => c.id === creatorId);
    setVideosForCreator(creator ? creator.videos : []);
  }
  
  const getDeleteDialogContent = () => {
    switch(deleteType) {
        case 'technology':
            return {
                title: "Delete Technology?",
                description: "This action cannot be undone. This will permanently delete the selected technology and all of its associated creators and videos."
            };
        case 'creator':
            return {
                title: "Delete Creator?",
                description: "This action cannot be undone. This will permanently delete the selected creator and all of their videos."
            };
        case 'video':
             return {
                title: "Delete Video?",
                description: "This action cannot be undone. This will permanently delete the selected video."
            };
        default:
            return {
                title: "Are you sure?",
                description: "This action cannot be undone."
            }
    }
  }
  const { title: deleteTitle, description: deleteDescription } = getDeleteDialogContent();

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
                                <Select onValueChange={handleTechChange}>
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
                                <Select disabled={creatorsForTech.length === 0} onValueChange={handleCreatorChange}>
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
            <CardContent>
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="text-lg text-destructive">Unified Delete Service</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="space-y-2">
                            <Label htmlFor="delete-type-select">Content Type</Label>
                            <Select onValueChange={(value: 'technology' | 'creator' | 'video' | '') => setDeleteType(value)}>
                                <SelectTrigger id="delete-type-select" className="border-destructive focus:ring-destructive">
                                    <SelectValue placeholder="Select what to delete" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="technology">Technology</SelectItem>
                                    <SelectItem value="creator">Creator</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        
                        {deleteType && (
                            <div className="space-y-4 pt-4 border-t border-dashed border-destructive/50">
                                {deleteType === 'technology' && (
                                     <div className="space-y-2">
                                        <Label htmlFor="tech-select-delete">Technology</Label>
                                        <Select>
                                            <SelectTrigger id="tech-select-delete" className="border-destructive focus:ring-destructive">
                                                <SelectValue placeholder="Select a technology" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {technologies.map(tech => (
                                                    <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                
                                {(deleteType === 'creator' || deleteType === 'video') && (
                                    <div className="space-y-2">
                                        <Label htmlFor="tech-select-delete-cascade">Technology</Label>
                                        <Select onValueChange={handleTechChangeForDelete}>
                                            <SelectTrigger id="tech-select-delete-cascade" className="border-destructive focus:ring-destructive">
                                                <SelectValue placeholder="Select a technology" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {technologies.map(tech => (
                                                    <SelectItem key={tech.id} value={tech.id}>{tech.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                 {(deleteType === 'creator' || deleteType === 'video') && (
                                     <div className="space-y-2">
                                        <Label htmlFor="creator-select-delete-cascade">Creator</Label>
                                        <Select onValueChange={handleCreatorChangeForDelete} disabled={creatorsForTech.length === 0}>
                                            <SelectTrigger id="creator-select-delete-cascade" className="border-destructive focus:ring-destructive">
                                                <SelectValue placeholder="Select a creator" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {creatorsForTech.map(creator => (
                                                    <SelectItem key={creator.id} value={creator.id}>{creator.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                
                                {deleteType === 'video' && (
                                     <div className="space-y-2">
                                        <Label htmlFor="video-select-delete-cascade">Video</Label>
                                        <Select disabled={videosForCreator.length === 0}>
                                            <SelectTrigger id="video-select-delete-cascade" className="border-destructive focus:ring-destructive">
                                                <SelectValue placeholder="Select a video" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {videosForCreator.map(video => (
                                                    <SelectItem key={video.id} value={video.id}>{video.title}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                            </div>
                        )}

                    </CardContent>
                    <div className="p-6 pt-0">
                         <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="w-full" disabled={!deleteType}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Selected Content
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>{deleteTitle}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        {deleteDescription}
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
