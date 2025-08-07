
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUser } from '@/context/UserContext';
import type { Video, Technology, Creator } from '@/types';
import { Flame, ShieldCheck, Star } from 'lucide-react';
import { differenceInCalendarDays, isToday, isYesterday } from 'date-fns';

const Badge = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
        <div className="p-3 rounded-full bg-primary/10 text-primary">
            {icon}
        </div>
        <div>
            <p className="font-bold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
        </div>
    </div>
);

export default function AnalyticsPage() {
  const { technologies } = useUser();

  const analyticsData = React.useMemo(() => technologies.map(tech => {
    const techVideos: Video[] = tech.creators.flatMap(c => c.videos);
    
    const completed = techVideos.filter(v => v.status === 'Completed').length;
    const inProgress = techVideos.filter(v => v.status === 'In Progress').length;
    const notStarted = techVideos.length - completed - inProgress;
    
    return {
      name: tech.name,
      completed,
      inProgress,
      notStarted,
    };
  }), [technologies]);

  const completedVideos = React.useMemo(() => {
    return technologies
      .flatMap(tech => tech.creators.flatMap(creator => creator.videos))
      .filter(video => video.status === 'Completed' && video.completedAt)
      .map(video => ({ ...video, completedAt: video.completedAt!.toDate() }))
      .sort((a, b) => b.completedAt!.getTime() - a.completedAt!.getTime());
  }, [technologies]);


  const learningStreak = React.useMemo(() => {
    if (completedVideos.length === 0) {
        return 0;
    }

    const completionDates = [...new Set(completedVideos.map(v => v.completedAt!.toISOString().split('T')[0]))]
      .map(dateStr => new Date(dateStr))
      .sort((a,b) => b.getTime() - a.getTime());

    if (completionDates.length === 0) return 0;

    let streak = 0;
    const firstDate = completionDates[0];

    if (isToday(firstDate) || isYesterday(firstDate)) {
        streak = 1;
        for (let i = 1; i < completionDates.length; i++) {
            const diff = differenceInCalendarDays(completionDates[i - 1], completionDates[i]);
            if (diff === 1) {
                streak++;
            } else {
                break;
            }
        }
    }
    
    return streak;
  }, [completedVideos]);


  const achievementBadges = React.useMemo(() => {
    const badges = [];

    technologies.forEach(tech => {
        const allTechVideos = tech.creators.flatMap(c => c.videos);
        if (allTechVideos.length > 0 && allTechVideos.every(v => v.status === 'Completed')) {
            badges.push({
                id: `tech-${tech.id}`,
                icon: <ShieldCheck className="h-6 w-6" />,
                title: `${tech.name} Master`,
                description: `Completed all ${allTechVideos.length} videos.`,
            });
        }

        tech.creators.forEach(creator => {
            if (creator.videos.length > 0 && creator.videos.every(v => v.status === 'Completed')) {
                badges.push({
                    id: `creator-${tech.id}-${creator.id}`,
                    icon: <Star className="h-6 w-6" />,
                    title: `${creator.name} Fan`,
                    description: `Completed all of their videos in ${tech.name}.`,
                });
            }
        });
    });

    return badges;
  }, [technologies]);

  return (
    <>
      <div className="flex items-center mb-6">
        <h1 className="text-lg font-semibold md:text-2xl font-headline">Your Learning Analytics</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
             <CardHeader>
                <CardTitle>Learning Streak</CardTitle>
                <CardDescription>Keep the flame alive by learning every day!</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center">
                <div className="relative flex items-center justify-center">
                    <Flame className="h-32 w-32 text-orange-400" strokeWidth={1.5} />
                    <span className="absolute text-3xl font-bold text-white drop-shadow-md">{learningStreak}</span>
                </div>
                <p className="text-lg font-bold">{learningStreak} Day{learningStreak !== 1 && 's'}</p>
                <p className="text-sm text-muted-foreground">
                    {learningStreak > 0 ? "You're on fire!" : "Complete a video to start a streak."}
                </p>
            </CardContent>
        </Card>

        <Card className="md:col-span-2">
            <CardHeader>
            <CardTitle>Technology Progress</CardTitle>
            <CardDescription>Breakdown of your video progress across different technologies.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analyticsData} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} tick={{fontSize: 12}} />
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
                    <Legend wrapperStyle={{fontSize: "12px"}} />
                    <Bar dataKey="completed" fill="hsl(var(--chart-2))" name="Completed" stackId="a" />
                    <Bar dataKey="inProgress" fill="hsl(var(--chart-4))" name="In Progress" stackId="a" />
                    <Bar dataKey="notStarted" fill="hsl(var(--muted))" name="Not Started" stackId="a" />
                </BarChart>
                </ResponsiveContainer>
            </div>
            </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
            <CardTitle>Achievement Badges</CardTitle>
            <CardDescription>Celebrate your learning milestones. Here are the badges you've unlocked so far.</CardDescription>
        </CardHeader>
        <CardContent>
            {achievementBadges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {achievementBadges.map(badge => (
                        <Badge key={badge.id} icon={badge.icon} title={badge.title} description={badge.description} />
                    ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-12">
                    <p>Your badge collection is awaiting its first entry.</p>
                    <p>Complete all videos in a technology or by a creator to earn one!</p>
                </div>
            )}
        </CardContent>
      </Card>
    </>
  );
}
