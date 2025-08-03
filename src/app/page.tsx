
'use client';

import { AstrydeLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUser } from '@/context/UserContext';
import { auth } from '@/lib/firebase';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect, useCallback } from 'react';
import { GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { Mail, Phone } from 'lucide-react';


declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
        confirmationResult: ConfirmationResult;
    }
}


export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useUser();
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [error, setError] = useState('');


  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const setupRecaptcha = useCallback(() => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response: any) => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
        },
      });
    }
  }, []);

  useEffect(() => {
    if (authMethod === 'phone') {
        setupRecaptcha();
    }
  }, [authMethod, setupRecaptcha]);



  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!phoneNumber) {
        setError("Please enter a phone number.");
        return;
    }

    try {
      const result = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(result);
    } catch (error: any) {
      setError(`Error sending verification code: ${error.message}`);
      console.error(error);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      if (!confirmationResult) {
          setError("Please send a verification code first.");
          return;
      }
      try {
        await confirmationResult.confirm(verificationCode);
        router.push('/dashboard');
      } catch(error: any) {
        setError(`Error verifying code: ${error.message}`);
      }
  }
  
  if (loading || user) {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <AstrydeLogo />
        </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div id="recaptcha-container"></div>
      <div className="absolute top-4 left-4">
        <AstrydeLogo />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Welcome to Astryde</CardTitle>
          <CardDescription>Your cosmic journey to mastering tech skills starts here.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
                <Button variant={authMethod === 'email' ? 'default' : 'outline'} onClick={() => setAuthMethod('email')}>
                    <Mail className="mr-2"/> Email
                </Button>
                <Button variant={authMethod === 'phone' ? 'default' : 'outline'} onClick={() => setAuthMethod('phone')}>
                    <Phone className="mr-2" /> Phone
                </Button>
            </div>

            {authMethod === 'email' && (
                <form className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                        id="email" 
                        type="email" 
                        placeholder="voyager@astryde.dev" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
                    </div>
                    <Button type="submit" className="w-full" disabled>
                        Sign In with Email (Coming Soon)
                    </Button>
                </form>
            )}

            {authMethod === 'phone' && (
                <>
                {!confirmationResult ? (
                    <form onSubmit={handlePhoneLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input 
                                id="phone" 
                                type="tel" 
                                placeholder="+1 555-555-5555" 
                                required 
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Send Verification Code
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyCode} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Verification Code</Label>
                            <Input 
                                id="code" 
                                type="text" 
                                placeholder="Enter 6-digit code" 
                                required 
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value)}
                            />
                        </div>
                        <Button type="submit" className="w-full">
                            Verify & Sign In
                        </Button>
                    </form>
                )}
                </>
            )}

            <Separator className="my-6" />

            <div className="space-y-4">
                <Button variant="outline" className="w-full" onClick={handleGoogleLogin}>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 48 48">
                    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
                    <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
                    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
                    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.596 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"/>
                </svg>
                Sign In with Google
                </Button>
            </div>
            {error && <p className="text-destructive text-sm text-center mt-4">{error}</p>}
        </CardContent>
      </Card>
    </div>
  );
}
