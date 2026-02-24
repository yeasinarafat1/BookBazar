"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LogOut, LayoutDashboard, Users, BookOpen, FileCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function AdminHeader() {
  return (
    <header className="bg-background border-b border-border sticky top-0 z-50">
      
      {/* Top Row: Branding & Global Actions */}
      <div className="border-b border-border/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Logo & Breadcrumb-ish feel */}
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center gap-2 transition-opacity hover:opacity-80">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <Shield className="w-5 h-5" />
                </div>
                <div className="hidden sm:block">
                  <h1 className="font-semibold text-foreground leading-tight">Admin</h1>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Dashboard</p>
                </div>
              </Link>
              
              {/* Vertical Divider */}
              <div className="h-6 w-px bg-border/60 hidden sm:block" />
              
              <div className="hidden sm:flex items-center text-sm text-muted-foreground">
                <span className="font-medium text-foreground">BookBazar</span>
                <ChevronRight className="w-4 h-4 mx-1 opacity-50" />
                <span>Management Portal</span>
              </div>
            </div>

            {/* Right: User & Exit */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-sm font-medium">Administrator</span>
                <span className="text-xs text-muted-foreground">admin@bookbazar.com</span>
              </div>
              <Button variant="outline" size="sm" className="gap-2 text-muted-foreground hover:text-foreground" asChild>
                <Link href="/">
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Exit to App</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Navigation Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-1 overflow-x-auto -mb-px pt-1 hide-scrollbar">
          <NavLink href="/admin/overview" icon={LayoutDashboard} label="Overview" />
          <NavLink href="/admin/users" icon={Users} label="Users" />
          <NavLink href="/admin/books" icon={BookOpen} label="Books" />
          <NavLink href="/admin/verifications" icon={FileCheck} label="Verifications" />
          <NavLink href="/admin/reports" icon={FileCheck} label="Reports" />
        </nav>
      </div>
    </header>
  );
}

function NavLink({ href, icon: Icon, label }: { href: string; icon: any; label: string }) {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all duration-200 whitespace-nowrap",
        isActive
          ? "border-primary text-primary bg-primary/5"
          : "border-transparent text-muted-foreground hover:text-foreground hover:border-border/50"
      )}
    >
      <Icon className={cn("w-4 h-4", isActive ? "text-primary" : "text-muted-foreground")} />
      {label}
    </Link>
  );
}