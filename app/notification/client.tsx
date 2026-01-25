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
  AlertCircle,
  Banknote,
  Handshake
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { markNotificationAsRead, markAllNotificationsAsRead } from '@/lib/action/notification';


// --- Types based on your DB Schema ---
type NotificationType = 
  | 'verification_pending' | 'verification_approved' | 'verification_rejected'
  | 'book_approved' | 'book_rejected' | 'book_sold'
  | 'contract_offer' | 'contract_accepted' | 'contract_cancelled'
  | 'system_alert';

interface Notification {
  id: string;
  type: string; // Changed to string to match DB enum return type safely
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
  link: string | null;
}

// --- Helper for Icons & Colors ---
const getStatusStyles = (type: string) => {
  switch (type as NotificationType) {
    // Verification
    case 'verification_approved':
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: UserCheck };
    case 'verification_rejected':
      return { bg: 'bg-red-50', text: 'text-red-600', icon: XCircle };
    case 'verification_pending':
      return { bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock };
    
    // Books
    case 'book_approved':
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle2 };
    case 'book_rejected':
      return { bg: 'bg-red-50', text: 'text-red-600', icon: XCircle };
    case 'book_sold':
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: Banknote };

    // Contracts
    case 'contract_accepted':
      return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: Handshake };
    case 'contract_cancelled':
      return { bg: 'bg-red-50', text: 'text-red-600', icon: XCircle };
    case 'contract_offer':
      return { bg: 'bg-blue-50', text: 'text-blue-600', icon: BookOpen };
    
    // Default / System
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-600', icon: Bell };
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
    // Optimistic Update
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    // Server Action
    await markAllNotificationsAsRead();
    router.refresh();
  };

  const handleClick = async (notification: Notification) => {
    // 1. Mark as read optimistically
    if (!notification.isRead) {
      setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, isRead: true } : n));
      await markNotificationAsRead(notification.id);
      router.refresh();
    }

    // 2. Navigate if link exists
    if (notification.link) {
      router.push(notification.link);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-24">
   

      <main className="container max-w-2xl mx-auto px-4 pt-8">
        
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex gap-4">
            <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <Bell className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-500 text-sm mt-1">
                {unreadCount} unread notifications
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAll}
              className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              "h-10 px-5 rounded-full flex items-center justify-center text-sm font-medium transition-all",
              filter === 'all' 
                ? "bg-emerald-600 text-white shadow-sm" 
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            All
          </button>
          
          <button
            onClick={() => setFilter('unread')}
            className={cn(
              "h-10 px-5 rounded-full flex items-center gap-2 text-sm font-medium transition-all border",
              filter === 'unread'
                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            )}
          >
            Unread
            {unreadCount > 0 && (
              <span className={cn(
                "ml-1 text-xs px-1.5 py-0.5 rounded-full",
                filter === 'unread' ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
              )}>
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        {/* List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-20">
              <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No notifications found</p>
              <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
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
                    "hover:shadow-md bg-white",
                    // Visual logic: Green tint if unread, plain if read
                    !notification.isRead 
                      ? "border-emerald-100 ring-1 ring-emerald-50 bg-emerald-50/10"
                      : "border-gray-100 opacity-75 hover:opacity-100" 
                  )}
                >
                  {/* Unread Indicator Dot */}
                  {!notification.isRead && (
                    <div className="absolute top-5 right-5 h-2 w-2 rounded-full bg-emerald-500" />
                  )}

                  {/* Icon Box */}
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                    style.bg
                  )}>
                    <Icon className={cn("h-5 w-5", style.text)} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5 pr-4">
                    <div className="flex justify-between items-start">
                      <h3 className={cn(
                        "font-semibold text-gray-900",
                        !notification.isRead && "text-emerald-950"
                      )}>
                        {notification.title}
                      </h3>
                    </div>
                    
                    <p className="text-sm text-gray-600 mt-1 leading-relaxed line-clamp-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center gap-1 mt-3 text-xs text-gray-400 font-medium">
                      <Clock className="h-3 w-3" />
                      {timeAgo}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

    
    </div>
  );
}