'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, PlusCircle, MessageCircle, User as UserIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User} from '@/db/Schemas/user';
import { useCurrentUser } from '@/lib/hook/user';



export  function BottomNav() {
  const pathname = usePathname();
  const { user } = useCurrentUser();
  const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/browse', label: 'Browse', icon: Search },
  { href: '/sell', label: 'Sell', icon: PlusCircle },
  { href: '/messages', label: 'Messages', icon: MessageCircle },
  { href: `/profile/${user?.username}`, label: 'Profile', icon: UserIcon },
];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/50 bg-background/80 backdrop-blur-xl md:hidden">
      <div className="flex items-center justify-around py-2 px-2 pb-safe">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/' && pathname.startsWith(item.href));
          const isSell = item.href === '/sell';
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center gap-0.5 py-2 px-4 rounded-2xl transition-all duration-300",
                isActive && !isSell && "text-primary",
                !isActive && !isSell && "text-muted-foreground hover:text-foreground",
                isSell && "px-2"
              )}
            >
              {isSell ? (
                <div className={cn(
                  "flex h-14 w-14 -mt-7 items-center justify-center rounded-2xl shadow-lg transition-all duration-300",
                  "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
                  "hover:scale-105 hover:shadow-primary/40 hover:shadow-xl",
                  "active:scale-95"
                )}>
                  <item.icon className="h-6 w-6" />
                </div>
              ) : (
                <>
                  <div className={cn(
                    "relative p-2 rounded-xl transition-all duration-300",
                    isActive && "bg-primary/10"
                  )}>
                    <item.icon className={cn(
                      "h-5 w-5 transition-transform duration-300",
                      isActive && "scale-110"
                    )} />
                    {isActive && (
                      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                    )}
                  </div>
                  <span className={cn(
                    "text-[10px] font-medium transition-all duration-300",
                    isActive ? "opacity-100" : "opacity-70"
                  )}>
                    {item.label}
                  </span>
                </>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}