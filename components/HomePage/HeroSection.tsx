"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const stats = [
    { value: "500+", label: "Books Listed" },
    { value: "200+", label: "Active Sellers" },
    { value: "50%", label: "Avg. Savings" },
  ];

  return (
    <section className="relative overflow-hidden gradient-hero">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg
          className="h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <pattern
            id="grid"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 10 0 L 0 0 0 10"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="container relative mx-auto px-4 py-12 sm:py-16 md:py-20">
        <div className="max-w-2xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            Your Polytechnic Book Marketplace
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-foreground mb-4 leading-tight">
            Buy & Sell <span className="text-primary">Second-Hand Books</span>{" "}
            Easily
          </h1>

          {/* Subheading */}
          <p className="text-muted-foreground text-base sm:text-lg mb-8 max-w-lg mx-auto">
            Find affordable textbooks from your seniors or sell your old books
            to juniors. Save money, help others!
          </p>

          {/* Search Bar */}
          <form
            onSubmit={handleSearch}
            className="flex gap-2 max-w-md mx-auto mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for books..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch(e); // Call handleSearch when Enter key is pressed();
                  }
                }}
                className="pl-12 h-12 rounded-xl text-base"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-6 rounded-xl">
              Search
            </Button>
          </form>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 sm:gap-10">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full"
        >
          <path
            d="M0 60V30C240 50 480 10 720 30C960 50 1200 10 1440 30V60H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
