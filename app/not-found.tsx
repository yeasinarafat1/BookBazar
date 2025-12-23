'use client';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* Illustration */}
        <div className="mb-8 relative">
          <div className="h-32 w-32 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <BookOpen className="h-16 w-16 text-primary" />
          </div>
          <div className="absolute top-0 right-1/4 h-4 w-4 rounded-full bg-accent/50 animate-pulse" />
          <div className="absolute bottom-4 left-1/4 h-3 w-3 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
        
        {/* Content */}
        <h1 className="text-6xl font-extrabold text-primary mb-4">404</h1>
        <h2 className="text-2xl font-bold text-foreground mb-2">Page not found</h2>
        <p className="text-muted-foreground mb-8">
          Oops! The page you're looking for seems to have gone missing. 
          Maybe the book was already sold?
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button variant="hero" className="gap-2 w-full sm:w-auto">
              <Home className="h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Link href="/browse">
            <Button variant="outline" className="gap-2 w-full sm:w-auto">
              <BookOpen className="h-4 w-4" />
              Browse Books
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}