'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, PlusCircle, User, Home, Menu, X, BookOpen, LogIn, Shield, LogOut, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/nextjs';
import { useCurrentUser } from '@/lib/hook/user';
import { getUnreadNotificationCount } from '@/lib/action/notification'; // 👈 Import this
import { Badge } from '@/components/ui/badge'; // 👈 Import Badge

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0); // 👈 State for count
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const { signOut } = useClerk();
  
  const isAdmin = user?.role === 'admin';

  // 👈 Fetch unread count on mount
  useEffect(() => {
    const fetchCount = async () => {
      if (user) {
        const count = await getUnreadNotificationCount();
        setUnreadCount(count);
      }
    };
    fetchCount();
  }, [user, pathname]); // Re-fetch on path change to keep it updated

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/browse', label: 'Browse', icon: Search },
    { href: '/sell', label: 'Sell', icon: PlusCircle },
    { href: '/notification', label: 'Notification', icon: Bell }, // Ensure href matches your page
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
            <Link key={item.href} href={item.href} className="relative">
              <Button
                variant="ghost"
                className={cn(
                  "gap-2 font-medium cursor-pointer relative",
                  pathname === item.href && "text-primary hover:text-primary hover:bg-primary/5"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
                
                {/* 🔴 Badge Logic */}
                {item.label === 'Notification' && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </Link>
          ))}
          
          {isAdmin && (
            <Link href="/admin/overview">
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
          {mobileMenuOpen ? <X className="h-5 w-5" /> : (
            <div className="relative">
              <Menu className="h-5 w-5" />
              {/* Mobile Badge */}
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 h-3 w-3 rounded-full bg-red-500 ring-2 ring-white" />
              )}
            </div>
          )}
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
                    "w-full justify-between", // Changed to justify-between for badge placement
                    pathname === item.href && "bg-primary/10 text-primary"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </div>
                  
                  {/* Mobile Menu Item Badge */}
                  {item.label === 'Notification' && unreadCount > 0 && (
                    <Badge variant="destructive" className="h-5 px-1.5 min-w-[20px] justify-center">
                      {unreadCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            ))}
            
            {/* ... rest of mobile menu (Admin, Sign In/Out) ... */}
            {isAdmin && (
              <Link href="/admin" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start gap-3">
                  <Shield className="h-5 w-5" /> Admin Dashboard
                </Button>
              </Link>
            )}
            
            {/* ... Sign In/Out Buttons ... */}
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