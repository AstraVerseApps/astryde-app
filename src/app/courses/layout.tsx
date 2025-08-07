
"use client";

import { AstrydeLogo } from '@/components/icons';
import Header from '@/components/header';
import {
  Home,
  LineChart,
  Menu,
  Shield,
  ListChecks,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useUser } from '@/context/UserContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';


export default function CoursesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isAdmin, loading } = useUser();
  const router = useRouter();
  

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <AstrydeLogo />
        </div>
    )
  }

  return (
    <>
    <Header />
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link href="/courses" className="flex items-center gap-2 font-semibold">
              <AstrydeLogo />
            </Link>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <Link
                href="/courses"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Courses
              </Link>
              <Link
                href="/courses/progress"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <ListChecks className="h-4 w-4" />
                Progress
              </Link>
              <Link
                href="/courses/analytics"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <LineChart className="h-4 w-4" />
                Analytics
              </Link>
               
                {isAdmin && (
                    <Link
                    href="/courses/admin"
                    className="flex items-center gap-3 rounded-lg bg-primary/10 px-3 py-2 text-primary transition-all hover:text-primary"
                    >
                    <Shield className="h-4 w-4" />
                    Admin Panel
                    </Link>
                )}
            </nav>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="/courses"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <AstrydeLogo />
                </Link>
                <Link
                  href="/courses"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Courses
                </Link>
                 <Link
                  href="/courses/progress"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <ListChecks className="h-5 w-5" />
                  Progress
                </Link>
                <Link
                  href="/courses/analytics"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <LineChart className="h-5 w-5" />
                  Analytics
                </Link>
                {isAdmin && (
                    <Link
                        href="/courses/admin"
                        className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-primary/10 px-3 py-2 text-primary hover:text-foreground"
                    >
                        <Shield className="h-5 w-5" />
                        Admin Panel
                    </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* The search bar is removed from here and will be managed in the page component */}
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
    </>
  );
}
