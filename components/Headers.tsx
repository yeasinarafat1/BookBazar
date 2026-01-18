'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, PlusCircle, User, Home, Menu, X, BookOpen, LogIn, Shield, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/nextjs';
import { useCurrentUser } from '@/lib/hook/user';


export  function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { signOut } = useClerk();
  
  // Check if user is admin (you can store this in Clerk metadata)
  const isAdmin = user?.role === 'admin';
  
  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/browse', label: 'Browse', icon: Search },
    { href: '/sell', label: 'Sell', icon: PlusCircle },
    { href: `/profile/${user?.username}`, label: 'Profile', icon: User },
  ];

  const handleSignOut = () => {
    signOut();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform group-hover:scale-105">
            <BookOpen className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold text-foreground hidden sm:block">
            BookBazar
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "gap-2 font-medium cursor-pointer",
                  pathname === item.href && "text-primary hover:text-primary hover:bg-primary/5"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Button>
            </Link>
          ))}
          {isAdmin && (
            <Link href="/admin">
              <Button
                variant="ghost"
                className={cn(
                  "gap-2 font-medium cursor-pointer",
                  pathname === '/admin' && "text-primary hover:text-primary hover:bg-primary/5"
                )}
              >
                <Shield className="h-4 w-4" />
                Admin
              </Button>
            </Link>
          )}
        </nav>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          <SignedIn>
            <Link href="/sell">
              <Button variant="hero" className="gap-2 shadow-md cursor-pointer">
                <PlusCircle className="h-4 w-4" />
                Sell Book
              </Button>
            </Link>
            <Button variant="outline" size="sm" onClick={handleSignOut} className="font-medium cursor-pointer">
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in">
              <Button variant="hero" className="gap-2 shadow-md cursor-pointer">
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </SignedOut>
        </div>

        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card animate-slide-up">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
              >
                <Button
                  variant={pathname === item.href ? 'secondary' : 'ghost'}
                  className={cn(
                    "w-full justify-start gap-3",
                    pathname === item.href && "bg-primary/10 text-primary"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Button>
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button
                  variant={pathname === '/admin' ? 'secondary' : 'ghost'}
                  className="w-full justify-start gap-3"
                >
                  <Shield className="h-5 w-5" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
            <SignedIn>
              <Link href="/sell" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="hero" className="w-full gap-2 mt-2">
                  <PlusCircle className="h-5 w-5" />
                  Sell Your Book
                </Button>
              </Link>
              <Button variant="outline" className="w-full gap-2 mt-2" onClick={() => { handleSignOut(); setMobileMenuOpen(false); }}>
                <LogOut className="h-5 w-5" />
                Sign Out
              </Button>
            </SignedIn>
            
            <SignedOut>
              <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="hero" className="w-full gap-2 mt-2">
                  <LogIn className="h-5 w-5" />
                  Sign In
                </Button>
              </Link>
            </SignedOut>
          </nav>
        </div>
      )}
    </header>
  );
}