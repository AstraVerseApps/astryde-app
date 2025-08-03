
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUser } from '@/context/UserContext';
import type { Video } from '@/types';

export default function AnalyticsPage() {
  const { technologies } = useUser();

  const analyticsData = technologies.map(tech => {
    const techVideos: Video[] = tech.creators.flatMap(c => c.videos);
    
    const completed = techVideos.filter(v => v.status === 'Completed').length;
    const inProgress = techVideos.filter(v => v.status === 'In Progress').length;
    const notStarted = techVideos.filter(v => v.status === 'Not Started').length;
    
    return {
      name: tech.name,
      completed: completed,
      inProgress: inProgress,
      notStarted: notStarted,
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
          <CardDescription>Breakdown of your video progress across different technologies.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
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
                <Bar dataKey="completed" fill="#22c55e" name="Completed" stackId="a" />
                <Bar dataKey="inProgress" fill="#facc15" name="In Progress" stackId="a" />
                <Bar dataKey="notStarted" fill="#f97316" name="Not Started" stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
