
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
    const completed = techVideos.filter(v => {
        const userVideo = videos.find(uv => uv.id === v.id);
        return userVideo?.status === 'Completed';
    }).length;
    
    const pending = techVideos.length - completed;

    return {
      name: tech.name,
      completed: completed,
      pending: pending,
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
          <CardDescription>Breakdown of your completed and pending videos across technologies.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} layout="vertical" stackOffset="expand">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--muted))' }}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 'var(--radius)',
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                  formatter={(value, name, props) => [`${value} videos`, name]}
                />
                <Legend />
                <Bar dataKey="completed" fill="#22c55e" name="Completed" stackId="a" radius={[4, 0, 0, 4]} />
                <Bar dataKey="pending" fill="#f97316" name="Pending" stackId="a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
