
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUser } from '@/context/UserContext';
import { technologies } from '@/lib/data';
import type { Video } from '@/types';

export default function AnalyticsPage() {
  const { videos } = useUser();

  const analyticsData = technologies.map(tech => {
    const techVideos: Video[] = tech.creators.flatMap(c => c.videos);
    const totalVideos = techVideos.length;
    const completedVideos = techVideos.filter(v => {
        const userVideo = videos.find(uv => uv.id === v.id);
        return userVideo?.status === 'Completed';
    }).length;
    const progress = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;

    return {
      name: tech.name,
      progress: Math.round(progress),
    };
  });

  return (
    <>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Your Learning Analytics</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Technology Progress</CardTitle>
          <CardDescription>Your progress percentage across different technologies.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Legend />
                <Bar dataKey="progress" fill="hsl(var(--primary))" name="Progress (%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
