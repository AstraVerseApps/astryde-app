
'use client';

import Link from 'next/link';
import { AstrydeLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './theme-toggle';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuGroup, DropdownMenuItem } from './ui/dropdown-menu';
import { User as UserIcon, Settings, LogOut } from 'lucide-react';
import { usePathname } from 'next/navigation';

const GoogleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="24px" height="24px" {...props}>
        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
        <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
        <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.655-3.417-11.284-8.049l-6.571,4.819C9.656,39.663,16.318,44,24,44z" />
        <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.012,36.49,44,30.861,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
    </svg>
);


export default function Header() {
  const { user, signInWithGoogle, logout, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const userInitial = user?.email?.charAt(0).toUpperCase() || 'U';
  const userAvatar = user?.photoURL;
  const userDisplayName = user?.displayName || user?.email;

  const navLinks = [
    { href: '/about', text: 'About' },
    { href: '/features', text: 'Features' },
    { href: '/', text: 'Contact' },
    { href: '/', text: 'Contribute' },
  ];

  if (pathname === '/') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link href="/courses" className="flex items-center space-x-2">
            <AstrydeLogo />
          </Link>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="pr-0">
             <Link href="/courses" className="flex items-center space-x-2">
                <AstrydeLogo />
            </Link>
            <div className="flex flex-col space-y-3 mt-6">
             {navLinks.map(link => (
                <Link key={link.text} href={link.href} className="transition-colors hover:text-foreground/80 text-foreground/60">{link.text}</Link>
            ))}
            </div>
          </SheetContent>
        </Sheet>
        
        <nav className="hidden md:flex items-center justify-center space-x-6 text-sm font-medium">
            {navLinks.map(link => (
                <Link key={link.text} href={link.href} className="transition-colors hover:text-foreground/80 text-foreground/60">{link.text}</Link>
            ))}
        </nav>
        
        <div className="flex items-center justify-end space-x-2">
            <ThemeToggle />
            {!loading && (
                user ? (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="rounded-full">
                            <Avatar>
                            <AvatarImage src={userAvatar || `https://placehold.co/100x100/BFDBFE/1E3A8A/png?text=${userInitial}`} />
                            <AvatarFallback>{userInitial}</AvatarFallback>
                            </Avatar>
                            <span className="sr-only">Toggle user menu</span>
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                        <DropdownMenuLabel className="break-all">{userDisplayName}</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                            <DropdownMenuItem asChild>
                            <Link href="/courses/profile">
                                <UserIcon className="mr-2 h-4 w-4" />
                                <span>Profile</span>
                            </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                            <Settings className="mr-2 h-4 w-4" />
                            <span>Settings</span>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Logout</span>
                        </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ) : (
                    <Button onClick={signInWithGoogle} size="sm">
                        <GoogleIcon className="mr-2 h-4 w-4" />
                        Login
                    </Button>
                )
            )}
        </div>
      </div>
    </header>
  );
}
