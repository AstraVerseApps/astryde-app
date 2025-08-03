
'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PlusCircle, UploadCloud } from 'lucide-react';

export default function AdminPage() {
  return (
    <>
      <div className="flex items-center">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Admin Control Panel</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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

        <Card>
          <CardHeader>
            <CardTitle>Add New Creator</CardTitle>
            <CardDescription>Add a new content creator to a technology.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
        
        <Card className="md:col-span-2">
            <CardHeader>
                <CardTitle>Add New Video</CardTitle>
                <CardDescription>Add a new video from a creator.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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

