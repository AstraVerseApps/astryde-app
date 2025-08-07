
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import Link from 'next/link';

export default function ContactPage() {
  const [inquiryType, setInquiryType] = useState('query');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  const getSubject = () => {
    switch (inquiryType) {
      case 'query':
        return 'General Query';
      case 'feature':
        return 'New Feature Request';
      case 'playlist':
        return 'New Playlist Addition';
      default:
        return 'Inquiry from Astryde';
    }
  };

  const getBody = () => {
    let bodyContent = '';
    if (inquiryType === 'playlist') {
        bodyContent = `Playlist URL: ${message}`;
    } else {
        bodyContent = `Message: \n${message}`;
    }
    return encodeURIComponent(`${bodyContent}\n\nFrom: ${email}`);
  }

  return (
    <div className="bg-background text-foreground">
        <section className="relative py-20 md:py-32 text-center bg-muted/30">
            <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-20"></div>
            <div className="container relative z-10">
            <h1 className="text-4xl md:text-6xl font-bold font-headline">
                Get In Touch
            </h1>
            <p className="mt-4 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Have a question, a feature idea, or a new course playlist to share? We'd love to hear from you.
            </p>
            </div>
        </section>

        <section className="py-16 md:py-24">
            <div className="container max-w-2xl mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Form</CardTitle>
                        <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="inquiry-type">Reason for Contact</Label>
                            <Select value={inquiryType} onValueChange={setInquiryType}>
                                <SelectTrigger id="inquiry-type">
                                    <SelectValue placeholder="Select a reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="query">General Query</SelectItem>
                                    <SelectItem value="feature">Feature Request</SelectItem>
                                    <SelectItem value="playlist">New Video Playlist Addition</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">
                                {inquiryType === 'playlist' ? 'Playlist URL' : 'Your Message'}
                            </Label>
                            {inquiryType === 'playlist' ? (
                                <Input 
                                    id="message" 
                                    placeholder="https://youtube.com/playlist?list=..."
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            ) : (
                                <Textarea 
                                    id="message" 
                                    placeholder="Please describe your query or feature request in detail..." 
                                    rows={6}
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                />
                            )}
                        </div>

                         <div className="space-y-2">
                            <Label htmlFor="email">Your Email Address</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        
                        <Button asChild className="w-full" size="lg">
                            <a href={`mailto:astrydeapp@gmail.com?subject=${getSubject()}&body=${getBody()}`}>
                                <Send className="mr-2" />
                                Send Message
                            </a>
                        </Button>
                    </CardContent>
                </Card>
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
