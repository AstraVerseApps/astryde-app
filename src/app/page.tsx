
"use client";

import { AstrydeLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useState, FormEvent } from "react";
import { useToast } from "@/hooks/use-toast";


export default function LoginPage() {
  const router = useRouter();
  const { user, signUp, signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password);
      router.push('/dashboard');
    } catch (error: any) {
        toast({
            title: "Sign Up Error",
            description: error.message,
            variant: "destructive",
        })
    }
  };

  const handleSignIn = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
      router.push('/dashboard');
    } catch (error: any) {
       toast({
            title: "Sign In Error",
            description: error.message,
            variant: "destructive",
        })
    }
  };
  
  if (user) {
    router.push('/dashboard');
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="absolute top-4 left-4">
            <AstrydeLogo />
        </div>
      <div className="grid lg:grid-cols-2 gap-16 items-center max-w-6xl w-full">
        <div className="hidden lg:flex flex-col items-center justify-center">
            <Image src="https://placehold.co/600x400/BFDBFE/1E3A8A" width={600} height={400} alt="Astryde App illustration" className="rounded-lg shadow-2xl" data-ai-hint="space technology" />
            <div className="mt-8 text-center">
                <h2 className="text-3xl font-bold font-headline">Explore a Galaxy of Knowledge</h2>
                <p className="mt-4 text-muted-foreground max-w-md">Astryde is your personal launchpad to mastering new technologies. Track your progress, get AI-powered suggestions, and join a community of learners.</p>
            </div>
        </div>
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-headline">Welcome, Voyager</CardTitle>
            <CardDescription>Sign in or create an account to begin your journey.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-4">
                 <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="voyager@astryde.dev" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <div className="flex gap-2">
                    <Button onClick={handleSignIn} className="w-full">Sign In</Button>
                    <Button onClick={handleSignUp} variant="secondary" className="w-full">Sign Up</Button>
                </div>
            </form>
          </CardContent>
           <CardFooter className="text-center text-xs text-muted-foreground flex-col">
              By continuing, you agree to our Terms of Service.
              <a href="#" className="underline ml-1">Learn more.</a>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
