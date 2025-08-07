
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Compass, Target, TrendingUp, Users, Bot, ListChecks, Shield, Star, Flame, Search, MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: <Compass className="w-10 h-10 text-primary" />,
    title: 'Structured Learning Paths',
    description: 'Explore technologies like Python or AI, choose from expert creators, and follow their curated video playlists to build your skills methodically.',
  },
  {
    icon: <ListChecks className="w-10 h-10 text-primary" />,
    title: 'Detailed Progress Tracking',
    description: 'Mark videos as "Not Started," "In Progress," or "Completed." Your progress is saved to your profile, so you can always pick up where you left off.',
  },
  {
    icon: <TrendingUp className="w-10 h-10 text-primary" />,
    title: 'Learning Analytics',
    description: 'Visualize your journey with detailed charts showing your progress across all technologies. Track your daily learning and stay motivated.',
  },
  {
    icon: <Flame className="w-10 h-10 text-primary" />,
    title: 'Daily Learning Streak',
    description: 'Stay consistent and build momentum. Your learning streak increases for every consecutive day you complete at least one video.',
  },
   {
    icon: <Star className="w-10 h-10 text-primary" />,
    title: 'Achievement Badges',
    description: 'Earn badges for mastering a technology by completing all of its videos, or for becoming a fan of a creator by watching all their content.',
  },
  {
    icon: <Search className="w-10 h-10 text-primary" />,
    title: 'Easy Navigation & Search',
    description: 'Quickly find the topics and creators that interest you with our built-in search functionality on the main courses page.',
  },
];

export default function FeaturesPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 text-center bg-muted/30">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-20"></div>
        <div className="container relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-headline">
            Tools for Your Tech Odyssey
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Astryde is equipped with a suite of powerful features designed to make your learning experience seamless, engaging, and effective. Discover how we help you navigate the tech galaxy.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-3xl font-bold text-center font-headline mb-12">Core Features for Every Learner</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature) => (
              <Card key={feature.title} className="text-center p-6 border-transparent hover:border-primary hover:shadow-lg transition-all">
                <div className="flex justify-center mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container text-center">
          <h2 className="text-3xl font-bold font-headline">Have an Idea for a New Feature?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            We're always looking to improve. If you have a suggestion for a new feature, a course you'd like to see, or a creator playlist to add, please let us know!
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/contact">Contact Us</Link>
          </Button>
        </div>
      </section>
      <style jsx>{`
            .bg-grid-pattern {
                background-image: linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px);
                background-size: 40px 40px;
            }
       `}</style>
    </div>
  );
}
