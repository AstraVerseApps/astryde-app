
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Compass, Target, TrendingUp, Users, MessageSquarePlus } from 'lucide-react';
import Link from 'next/link';

const features = [
  {
    icon: <Compass className="w-8 h-8 text-primary" />,
    title: 'Curated Learning Paths',
    description: 'Navigate the vast universe of tech with guided paths curated from the best creators in the galaxy. No more guesswork, just learning.',
  },
  {
    icon: <TrendingUp className="w-8 h-8 text-primary" />,
    title: 'Track Your Progress',
    description: "Visually track your journey from 'Not Started' to 'Completed' for every video. Our analytics help you see how far you've come.",
  },
  {
    icon: <Check className="w-8 h-8 text-primary" />,
    title: 'Gamified Experience',
    description: 'Stay motivated with learning streaks and earn achievement badges for mastering technologies and completing all videos from your favorite creators.',
  },
  {
    icon: <MessageSquarePlus className="w-8 h-8 text-primary" />,
    title: 'Contribute Content',
    description: 'Have a favorite creator or a topic you want to learn? Suggest new video playlists through our contact page to help expand the learning galaxy.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 text-center bg-muted/30">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-20"></div>
        <div className="container relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold font-headline">
            Your Co-Pilot in the Tech Galaxy
          </h1>
          <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Astryde is more than a platform; it's your guide for mastering technology. We curate the best video content into clear, actionable learning paths, so you can focus on what matters most: building your skills.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 md:py-24">
        <div className="container text-center">
            <Target className="w-12 h-12 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold font-headline">Our Mission</h2>
            <p className="mt-4 text-muted-foreground max-w-2xl mx-auto">
                In the ever-expanding universe of technology, finding a clear path to knowledge can be overwhelming. Our mission is to chart that course for you. We meticulously organize the best learning content, providing structure and clarity to your educational journey, empowering you to reach your destination faster.
            </p>
        </div>
      </section>

      {/* How It Works Section */}
       <section className="py-16 md:py-24 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center font-headline mb-12">How It Works: Your 3-Step Launch Sequence</h2>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <Card>
              <CardHeader>
                <CardTitle>
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">1</div>
                    Explore Technologies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Choose a star system to explore. Each technology, from Python to System Design, is a unique world of knowledge.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">2</div>
                    Select a Creator
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Pick your guide. We feature renowned creators who are experts in their fields, ready to lead you through the content.</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                    <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl mb-4">3</div>
                    Watch and Track
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Engage with the video series and update your progress. Watch your skills grow as you conquer each learning module.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>


      {/* Key Features Section */}
      <section className="py-16 md:py-24">
        <div className="container">
          <h2 className="text-3xl font-bold text-center font-headline mb-12">Features Designed for Your Success</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start space-x-4">
                <div className="flex-shrink-0">{feature.icon}</div>
                <div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground mt-1">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary/5">
        <div className="container text-center">
          <h2 className="text-3xl font-bold font-headline">Ready to Launch Your Learning?</h2>
          <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
            Your journey into the tech galaxy awaits. Sign in to start exploring, tracking your progress, and earning achievements.
          </p>
          <Button asChild size="lg" className="mt-8">
            <Link href="/courses">Explore Courses</Link>
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
