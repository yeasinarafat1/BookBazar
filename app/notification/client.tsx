"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { 
  Bell, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  BookOpen, 
  UserCheck, 
  ChevronRight,
  Banknote,
  Handshake,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/action/notification';


// --- Types ---
type NotificationType = 
  | 'verification_pending' | 'verification_approved' | 'verification_rejected'
  | 'book_approved' | 'book_rejected' | 'book_sold'
  | 'contract_offer' | 'contract_accepted' | 'contract_cancelled'
  | 'system_alert';

interface Notification {
  id: string;
  type: string; 
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  link: string | null;
}

// --- Style Helper (Matches your screenshot colors) ---
const getStatusStyles = (type: string) => {
  switch (type as NotificationType) {
    // Yellow/Orange (Pending)
    case 'verification_pending':
      return { bg: 'bg-amber-100/50', text: 'text-amber-600', icon: Clock };
    
    // Green (Success/Approved)
    case 'verification_approved':
    case 'book_approved':
    case 'contract_accepted':
    case 'book_sold':
      return { bg: 'bg-emerald-100/50', text: 'text-emerald-600', icon: CheckCircle2 };

    // Red (Error/Rejected)
    case 'verification_rejected':
    case 'book_rejected':
    case 'contract_cancelled':
      return { bg: 'bg-red-100/50', text: 'text-red-600', icon: XCircle };
    
    // Blue (Info/Offer)
    case 'contract_offer':
    default:
      return { bg: 'bg-blue-100/50', text: 'text-blue-600', icon: Bell };
  }
};

export default function NotificationList({ initialData }: { initialData: any[] }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialData);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const router = useRouter();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : notifications.filter(n => !n.isRead);

  // --- Actions ---
  const handleMarkAll = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    await markAllNotificationsAsRead();
    router.refresh();
  };

  const handleClick = async (notification: Notification) => {
    if (!notification.isRead) {
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      await markNotificationAsRead(notification.id);
      router.refresh();
    }
    if (notification.link) router.push(notification.link);
  };

  return (
 

      <main className="container max-w-3xl mx-auto px-4 pt-8 md:pt-12">
        
        {/* --- Header Section --- */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex gap-4">
            {/* Bell Icon Circle */}
            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
              <Bell className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Notifications</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                {unreadCount} unread notifications
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAll}
              className="text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors mt-2"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* --- Tabs (Pill Style) --- */}
        <div className="flex items-center gap-2 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "h-9 w-9 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              filter === 'all' 
                ? "bg-emerald-500 text-white shadow-sm" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All
          </button>
          
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              "h-9 px-4 rounded-full flex items-center gap-2 text-sm font-medium transition-all border",
              filter === 'unread'
                ? "bg-emerald-500 text-white border-emerald-500 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className={cn(
                "ml-1 text-[10px] px-1.5 py-0.5 rounded-full font-bold",
                filter === 'unread' ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              )}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* --- Notification List --- */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
              <p className="text-gray-500 font-medium">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => {
              const style = getStatusStyles(notification.type);
              const Icon = style.icon;
              const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

              return (
                <div
                  key={notification.id}
                  onClick={() => handleClick(notification)}
                  className={cn(
                    "group relative p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4",
                    // If Unread: Light Mint Background + Emerald Border
                    // If Read: White Background + Gray Border
                    !notification.isRead 
                      ? "bg-[#ecfdf5] border-emerald-100 shadow-sm" // Matches the light green in image
                      : "bg-white border-gray-100 hover:border-gray-200" 
                  )}
                >
                  {/* Icon Box */}
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                    style.bg
                  )}>
                    <Icon className={cn("h-5 w-5", style.text)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-900 text-[15px]">
                        {notification.title}
                      </h3>
                      
                      {/* Unread Dot (Green Pulse) */}
                      {!notification.isRead && (
                        <div className="flex h-2.5 w-2.5 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </div>
                      )}
                      
                      {/* Chevron for Read items (Subtle) */}
                      {notification.isRead && (
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                      )}
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                      {notification.message}
                    </p>
                    
                    <p className="text-xs text-gray-400 mt-2.5 font-medium">
                      {timeAgo}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

   
  );
}