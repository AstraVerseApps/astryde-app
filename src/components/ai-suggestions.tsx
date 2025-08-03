
'use client';

import React, { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from './ui/card';
import { Button } from './ui/button';
import { Rocket, Sparkles, Clock } from 'lucide-react';
import { getSuggestions } from '@/app/dashboard/actions';
import type { Video } from '@/types';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';

interface AiSuggestionsProps {
  completedCourses: string[];
  subjectsOfInterest: string[];
  allVideos: Video[];
}

const trendingContent = ['v5', 'v8', 'v10']; // Mock trending content

export function AiSuggestions({ completedCourses, subjectsOfInterest, allVideos }: AiSuggestionsProps) {
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<Video[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleGetSuggestions = () => {
    startTransition(async () => {
      setError(null);
      const suggestedIds = await getSuggestions({
        completedCourses,
        subjectsOfInterest,
        trendingContent,
        numberOfSuggestions: 3,
      });

      if (suggestedIds && suggestedIds.length > 0) {
        const suggestedVideos = suggestedIds.map(id => allVideos.find(v => v.id === id)).filter(Boolean) as Video[];
        setSuggestions(suggestedVideos);
      } else {
        setError("Could not generate suggestions. Please complete more courses or try again later.");
        setSuggestions([]);
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary icon-glow" />
          AI Learning Copilot
        </CardTitle>
        <CardDescription>
          Get personalized recommendations for your next learning adventure based on your progress and interests.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
            <Alert variant="destructive" className="mb-4">
                <Rocket className="h-4 w-4" />
                <AlertTitle>Suggestion Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <div className="space-y-4">
          {isPending && (
            <>
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-24 w-40 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <Skeleton className="h-24 w-40 rounded-lg" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
            </>
          )}

          {!isPending && suggestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Your Next Steps:</h3>
              {suggestions.map(video => (
                 <div key={video.id} className="flex items-center justify-between p-3 group bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-40 h-24 bg-muted rounded-md overflow-hidden shrink-0">
                          <Image data-ai-hint="code abstract" src={video.thumbnail} alt={video.title} width={160} height={90} className="object-cover w-full h-full"/>
                      </div>
                      <div>
                        <p className="font-medium text-lg">{video.title}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {video.duration}</p>
                      </div>
                    </div>
                    <Button variant="default" size="sm">
                        Start Watching
                        <Rocket className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
              ))}
            </div>
          )}

           {!isPending && suggestions.length === 0 && !error && (
            <div className="text-center text-muted-foreground py-8">
                <p>Click the button to discover your next video.</p>
            </div>
           )}

        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleGetSuggestions} disabled={isPending || completedCourses.length === 0} className="w-full">
          <Rocket className="mr-2 h-4 w-4" />
          {isPending ? 'Analyzing Galaxy...' : 'Suggest Next Videos'}
        </Button>
      </CardFooter>
    </Card>
  );
}
