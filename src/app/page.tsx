
'use client';

import { AstrydeLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { BrainCircuit, Code, Dna, Bot, Atom, Rocket, Database, Binary, Network, Workflow, Sparkles } from 'lucide-react';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.655-3.417-11.284-8.049l-6.571,4.819C9.656,39.663,16.318,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,36.49,44,30.861,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);

const tech = [
    { name: 'Python', icon: <Code /> },
    { name: 'SQL', icon: <Database /> },
    { name: 'Web Dev', icon: <Code /> },
    { name: 'DSA', icon: <Binary /> },
    { name: 'System Design', icon: <Network /> },
    { name: 'Java', icon: <Code /> },
    { name: 'AI/ML', icon: <Bot /> },
    { name: 'Kafka', icon: <Workflow /> },
    { name: 'Spark', icon: <Sparkles /> },
    { name: 'Databases', icon: <Database /> },
];

const TechCarousel = () => {
  const duplicatedTech = [...tech, ...tech, ...tech];

  return (
    <div className="relative w-full h-full overflow-hidden [mask-image:_linear-gradient(to_right,transparent_0,_black_128px,_black_calc(100%-128px),transparent_100%)]">
      <div className="flex w-max animate-scroll">
        {duplicatedTech.map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-center h-48 w-48 m-4 bg-card/80 backdrop-blur-sm rounded-2xl border border-border/20 shadow-lg hover:border-primary/50 transition-all duration-300">
            <div className="text-primary">{React.cloneElement(item.icon, { className: 'h-12 w-12' })}</div>
            <p className="mt-4 text-lg font-semibold text-foreground">{item.name}</p>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes scroll {
          to {
            transform: translateX(-${100 / 3}%);
          }
        }
        .animate-scroll {
          animation: scroll 60s linear infinite;
        }
      `}</style>
    </div>
  );
};


export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInWithGoogle } = useUser();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  
  if (loading || (!loading && user)) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <AstrydeLogo />
        </div>
    )
  }

  return (
    <div className="relative min-h-screen w-full bg-background bg-gradient-to-br from-background via-secondary/50 to-background">
       <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-30"></div>
       <div className="relative min-h-screen w-full flex items-center justify-center p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-16 max-w-6xl w-full">
            <div className="flex flex-col items-start text-left">
                <AstrydeLogo />
                <h1 className="text-4xl md:text-5xl font-bold font-headline mt-6">
                    Your Cosmic Journey to
                    <span className="text-primary"> Mastering Tech.</span>
                </h1>
                <p className="text-lg text-muted-foreground mt-4">
                    Explore the universe of knowledge. Astryde is your launchpad to learning the most in-demand technologies from the best creators in the galaxy.
                </p>
                <Button size="lg" className="mt-8" onClick={signInWithGoogle}>
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Join the Mission - Sign In
                </Button>
            </div>
            <div className="hidden lg:flex items-center justify-center">
                <TechCarousel />
            </div>
        </div>
       </div>
       <style jsx>{`
            .bg-grid-pattern {
                background-image: linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px);
                background-size: 40px 40px;
            }
       `}</style>
    </div>
  );
}
