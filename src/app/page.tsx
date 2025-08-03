
"use client";

import { AstrydeLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuth, signInWithPopup, GoogleAuthProvider, RecaptchaVerifier } from "firebase/auth";
import { app } from "@/lib/firebase";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useEffect } from "react";

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
    confirmationResult?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const auth = getAuth(app);

  // Initialize ReCaptcha verifier
  useEffect(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        }
      });
    }
  }, [auth]);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Signed in as', user?.displayName);
      router.push('/dashboard');
    } catch (error) {
      console.error("Error during Google login:", error);
    }
  };

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
            <CardTitle className="text-2xl font-headline">Welcome Back, Voyager</CardTitle>
            <CardDescription>Sign in to continue your journey through the tech cosmos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button className="w-full" onClick={handleGoogleLogin}>
              <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512"><path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 126 23.4 172.9 61.9l-76.2 64.5c-20.5-16.2-49.3-26.6-80.7-26.6-62.8 0-113.4 50.8-113.4 113.3s50.6 113.3 113.4 113.3c71.4 0 99.1-53.8 102.7-77.5H248V261.8h239.2z"></path></svg>
              Sign in with Google
            </Button>
            <Button variant="secondary" className="w-full" disabled>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
              Sign in with Mobile (Coming Soon)
            </Button>
            <div id="recaptcha-container"></div>
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
