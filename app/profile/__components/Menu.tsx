'use client';
import { cn } from '@/lib/utils';
import { Edit, MessageCircle, Shield, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { SignOutButton } from '@clerk/nextjs';

const menuItems = [
  { icon: Edit, label: 'Edit Profile', href: '/profile/verify' },
  { icon: MessageCircle, label: 'My Messages', href: '/messages', badge: '3' },
  { icon: Shield, label: 'Verify Account', href: '/profile/verify' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: LogOut, label: 'Log Out', href: '/auth', destructive: true },
];

// 1. Define the props interface
interface RenderProps {
  label: string;
  href: string;
  className: string;
  children: React.ReactNode;
}

// 2. Convert to a proper functional component that accepts 'props'
const Render = ({ label, href, className, children }: RenderProps) => {
  if (label === "Log Out") {
    return (
      <SignOutButton>
        <button className={`cursor-pointer ${className}`}>
          {children}
        </button>
      </SignOutButton>
    );
  }

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
};

const Menu = () => {
  return (
    <div className="mt-8 rounded-2xl border border-border bg-card overflow-hidden">
      {menuItems.map((item, index) => (
        <Render
          key={item.label}
          label={item.label} // Fixed typo: lebel -> label
          href={item.href}
          className={cn(
            "w-full flex items-center gap-3 p-4 text-left transition-colors hover:bg-muted/50",
            index !== menuItems.length - 1 && "border-b border-border",
            item.destructive && "text-destructive"
          )}
        >
          {/* These are passed as 'children' to Render */}
          <item.icon className="h-5 w-5" />
          <span className="flex-1 font-medium">{item.label}</span>
          {item.badge && (
            <Badge variant="default" className="h-5 min-w-5 justify-center">
              {item.badge}
            </Badge>
          )}
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Render>
      ))}
    </div>
  );
};

export default Menu;