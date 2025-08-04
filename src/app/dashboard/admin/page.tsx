
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, UploadCloud, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Creator, Video } from '@/types';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useUser } from '@/context/UserContext';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { technologies, addTechnology, addCreator, addVideo, deleteTechnology, deleteCreator, deleteVideo } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const [creatorsForTech, setCreatorsForTech] = React.useState<Creator[]>([]);
  
  // Add state
  const [newTechName, setNewTechName] = React.useState('');
  const [newTechDesc, setNewTechDesc] = React.useState('');
  const [newCreatorName, setNewCreatorName] = React.useState('');
  const [selectedTechForNewCreator, setSelectedTechForNewCreator] = React.useState('');
  const [newVideoTitle, setNewVideoTitle] = React.useState('');
  const [newVideoDuration, setNewVideoDuration] = React.useState('');
  const [newVideoUrl, setNewVideoUrl] = React.useState('');
  const [selectedTechForNewVideo, setSelectedTechForNewVideo] = React.useState('');
  const [selectedCreatorForNewVideo, setSelectedCreatorForNewVideo] = React.useState('');


  // Delete state
  const [deleteType, setDeleteType] = React.useState<'technology' | 'creator' | 'video' | ''>('');
  const [selectedTechForDelete, setSelectedTechForDelete] = React.useState<string>('');
  const [selectedCreatorForDelete, setSelectedCreatorForDelete] = React.useState<string>('');
  const [selectedVideoForDelete, setSelectedVideoForDelete] = React.useState<string>('');

  const handleTechChangeForVideo = (techId: string) => {
    setSelectedTechForNewVideo(techId);
    const tech = technologies.find(t => t.id === techId);
    setCreatorsForTech(tech ? tech.creators : []);
    setSelectedCreatorForNewVideo('');
  };

  const handleAddTechnology = async () => {
    if (!newTechName || !newTechDesc) {
      toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please fill in all required fields for the new technology.',
      });
      return;
    }
    try {
      await addTechnology({ name: newTechName, description: newTechDesc, iconName: 'BrainCircuit' });
      toast({ title: 'Technology Created', description: 'The new technology has been added successfully.' });
      setNewTechName('');
      setNewTechDesc('');
    } catch (error) {
      console.error('Failed to add technology:', error);
      toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not add technology. Please try again.',
      });
    }
  };

  const handleAddCreator = async () => {
    if (!selectedTechForNewCreator || !newCreatorName) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please select a technology and provide a name for the creator.',
      });
      return;
    }
    try {
      await addCreator(selectedTechForNewCreator, {
        name: newCreatorName,
        avatar: 'https://placehold.co/100x100'
      });
      toast({ title: 'Creator Created', description: 'The new creator has been added successfully.' });
      setNewCreatorName('');
      setSelectedTechForNewCreator('');
    } catch (error) {
      console.error('Failed to add creator:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not add creator. Please try again.',
      });
    }
  };


  const handleAddVideo = async () => {
    if (!selectedTechForNewVideo || !selectedCreatorForNewVideo || !newVideoTitle || !newVideoUrl || !newVideoDuration) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields for the new video.',
      });
      return;
    }
    try {
      await addVideo(selectedTechForNewVideo, selectedCreatorForNewVideo, {
        title: newVideoTitle,
        duration: newVideoDuration,
        thumbnail: 'https://placehold.co/1280x720',
        url: newVideoUrl,
      });
      toast({ title: 'Video Created', description: 'The new video has been added successfully.' });
      setNewVideoTitle('');
      setNewVideoDuration('');
      setNewVideoUrl('');
      setSelectedTechForNewVideo('');
      setSelectedCreatorForNewVideo('');
      setCreatorsForTech([]);
    } catch (error) {
       console.error('Failed to add video:', error);
       toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not add video. Please try again.',
      });
    }
  };


  const handleDelete = async () => {
    try {
        if (deleteType === 'technology' && selectedTechForDelete) {
            await deleteTechnology(selectedTechForDelete);
        } else if (deleteType === 'creator' && selectedCreatorForDelete) {
            const techIdForCreator = technologies.find(t => t.creators.some(c => c.id === selectedCreatorForDelete))?.id;
            if(techIdForCreator) {
              await deleteCreator(techIdForCreator, selectedCreatorForDelete);
            }
        } else if (deleteType === 'video' && selectedVideoForDelete) {
            const techIdForVideo = technologies.find(t => t.creators.some(c => c.videos.some(v => v.id === selectedVideoForDelete)))?.id;
            const creatorIdForVideo = technologies.flatMap(t => t.creators).find(c => c.videos.some(v => v.id === selectedVideoForDelete))?.id;
            if (techIdForVideo && creatorIdForVideo) {
              await deleteVideo(techIdForVideo, creatorIdForVideo, selectedVideoForDelete);
            }
        }
        toast({ title: "Success", description: "Content deleted successfully." });
        setDeleteType('');
        setSelectedTechForDelete('');
        setSelectedCreatorForDelete('');
        setSelectedVideoForDelete('');
        router.refresh();
    } catch (error) {
        toast({ variant: 'destructive', title: "Error", description: "Failed to delete content." });
        console.error("Deletion failed:", error);
    }
  };
  

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

  const creatorsForDelete = React.useMemo(() => {
    if (!selectedTechForDelete) return [];
    const tech = technologies.find(t => t.id === selectedTechForDelete);
    return tech ? tech.creators : [];
  }, [selectedTechForDelete, technologies]);

  const videosForDelete = React.useMemo(() => {
     if (!selectedTechForDelete || !selectedCreatorForDelete) return [];
     const tech = technologies.find(t => t.id === selectedTechForDelete);
     const creator = tech?.creators.find(c => c.id === selectedCreatorForDelete);
     return creator ? creator.videos : [];
  }, [selectedTechForDelete, selectedCreatorForDelete, technologies]);

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
                            <Input id="tech-name" placeholder="e.g. Quantum Computing" value={newTechName} onChange={e => setNewTechName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="tech-desc">Description</Label>
                            <Input id="tech-desc" placeholder="A brief summary" value={newTechDesc} onChange={e => setNewTechDesc(e.target.value)} />
                        </div>
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button className="w-full" onClick={handleAddTechnology}>
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
                            <Select value={selectedTechForNewCreator} onValueChange={setSelectedTechForNewCreator}>
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
                            <Input id="creator-name" placeholder="e.g. Dr. Nova" value={newCreatorName} onChange={e => setNewCreatorName(e.target.value)} />
                        </div>
                    </CardContent>
                    <div className="p-6 pt-0">
                        <Button className="w-full" onClick={handleAddCreator}>
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
                                <Select value={selectedTechForNewVideo} onValueChange={handleTechChangeForVideo}>
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
                                <Select value={selectedCreatorForNewVideo} disabled={creatorsForTech.length === 0} onValueChange={setSelectedCreatorForNewVideo}>
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
                            <Input id="video-title" placeholder="e.g. Intro to Warp Drives" value={newVideoTitle} onChange={e => setNewVideoTitle(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="video-duration">Duration</Label>
                            <Input id="video-duration" placeholder="e.g. 42:10" value={newVideoDuration} onChange={e => setNewVideoDuration(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="video-url">YouTube Video URL</Label>
                            <Input id="video-url" placeholder="https://www.youtube.com/watch?v=..." value={newVideoUrl} onChange={e => setNewVideoUrl(e.target.value)} />
                        </div>
                    </CardContent>
                     <div className="p-6 pt-0">
                        <Button className="w-full" onClick={handleAddVideo}>
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
                            <Select onValueChange={(value: 'technology' | 'creator' | 'video' | '') => {
                                setDeleteType(value);
                                setSelectedTechForDelete('');
                                setSelectedCreatorForDelete('');
                                setSelectedVideoForDelete('');
                            }}>
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
                                {(deleteType === 'technology' || deleteType === 'creator' || deleteType === 'video') && (
                                     <div className="space-y-2">
                                        <Label htmlFor="tech-select-delete">Technology</Label>
                                        <Select value={selectedTechForDelete} onValueChange={(value) => {
                                            setSelectedTechForDelete(value);
                                            setSelectedCreatorForDelete('');
                                            setSelectedVideoForDelete('');
                                        }}>
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
                                        <Label htmlFor="creator-select-delete-cascade">Creator</Label>
                                        <Select 
                                            value={selectedCreatorForDelete}
                                            onValueChange={(value) => {
                                                setSelectedCreatorForDelete(value);
                                                setSelectedVideoForDelete('');
                                            }} 
                                            disabled={creatorsForDelete.length === 0}
                                        >
                                            <SelectTrigger id="creator-select-delete-cascade" className="border-destructive focus:ring-destructive">
                                                <SelectValue placeholder="Select a creator" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {creatorsForDelete.map(creator => (
                                                    <SelectItem key={creator.id} value={creator.id}>{creator.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}
                                
                                {deleteType === 'video' && (
                                     <div className="space-y-2">
                                        <Label htmlFor="video-select-delete-cascade">Video</Label>
                                        <Select 
                                            value={selectedVideoForDelete}
                                            onValueChange={setSelectedVideoForDelete}
                                            disabled={videosForDelete.length === 0}
                                        >
                                            <SelectTrigger id="video-select-delete-cascade" className="border-destructive focus:ring-destructive">
                                                <SelectValue placeholder="Select a video" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {videosForDelete.map(video => (
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
                                <Button variant="destructive" className="w-full" disabled={!deleteType || (deleteType === 'technology' && !selectedTechForDelete) || (deleteType === 'creator' && !selectedCreatorForDelete) || (deleteType === 'video' && !selectedVideoForDelete) }>
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
                                    <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
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
