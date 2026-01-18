'use client';

import { useState } from "react";
import { 
  CheckCircle, Heart, Package, ShoppingBag, X, ExternalLink 
} from "lucide-react";
import { BookCard } from "@/components/BookCard";
import { cn } from "@/lib/utils";
import { Book } from "@/db/Schemas/book";

// Define the type locally to avoid import errors
type TabType = 'listings' | 'sold' | 'purchased' | 'saved';

interface ProfileOverviewProps {
  userListedBook?: Book[]; 
  savedBooks?: Book[];
  isOwnProfile: boolean;     
}

const ProfileOverView = ({ 
  userListedBook = [], 
  savedBooks = [],
  isOwnProfile
}: ProfileOverviewProps) => {
  
  const [activeTab, setActiveTab] = useState<TabType>('listings');
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for the dialog

  // Filter Logic
  const userListings = userListedBook.filter((book) => !book.isSold);
  const soldBooks = userListedBook.filter((book) => book.isSold);
  const purchasedBooks: Book[] = []; 

  // Base tabs
  const baseTabs = [
    { id: 'listings' as TabType, label: 'Listed', icon: Package, count: userListings.length },
    { id: 'sold' as TabType, label: 'Sold', icon: CheckCircle, count: soldBooks.length },
    { id: 'purchased' as TabType, label: 'Purchased', icon: ShoppingBag, count: purchasedBooks.length },
  ];

  // Conditional tabs
  const tabs = isOwnProfile 
    ? [...baseTabs, { id: 'saved' as TabType, label: 'Saved', icon: Heart, count: savedBooks.length }]
    : baseTabs;

  const getActiveBooks = () => {
    switch (activeTab) {
      case 'listings': return userListings;
      case 'sold': return soldBooks;
      case 'purchased': return purchasedBooks;
      case 'saved': return savedBooks;
      default: return [];
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case 'listings': return "No active listings found";
      case 'sold': return "No sold books found";
      case 'purchased': return "No purchased books found";
      case 'saved': return "You haven't saved any books yet";
      default: return "No books found";
    }
  };

  // 1. Get all books for the current tab
  const allActiveBooks = getActiveBooks();

  // 2. Get only the first 3 for the main view
  const visibleBooks = allActiveBooks.slice(0, 3);
  
  // 3. Calculate remaining count
  const remainingCount = allActiveBooks.length - 3;

  // Identify the active tab object
  const activeTabInfo = tabs.find(t => t.id === activeTab);
  const ActiveIcon = activeTabInfo?.icon || tabs[0].icon;

  return (
    <div className="w-full relative">
      {/* Tabs Navigation */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted mb-6 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setIsDialogOpen(false); // Close dialog if tab changes
            }}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-fit",
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm ring-1 ring-black/5"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-primary" : "")} />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className={cn("text-xs py-0.5 px-1.5 rounded-full ml-1", activeTab === tab.id ? "bg-primary/10 text-primary" : "bg-muted-foreground/10")}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Main Content (Limited to 3) */}
      {visibleBooks.length > 0 ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {visibleBooks.map((book) => (
              <div key={book.id} className="relative group">
                <BookCard book={book} />
                {activeTab === 'sold' && (
                  <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-md shadow-sm z-10">
                    Sold
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* "View All" Button - Only shown if there are more than 3 items */}
          {remainingCount > 0 && (
            <div className="flex justify-center mt-6">
              <button 
                onClick={() => setIsDialogOpen(true)}
                className="group flex items-center gap-2 px-6 py-2.5 bg-muted/50 hover:bg-muted text-sm font-medium rounded-full transition-all border border-transparent hover:border-border"
              >
                View all {allActiveBooks.length} items
                <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/30 rounded-2xl border border-dashed border-muted-foreground/20">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
             {ActiveIcon && <ActiveIcon className="h-6 w-6 opacity-50" />}
          </div>
          <p className="font-medium">{getEmptyMessage()}</p>
        </div>
      )}

      {/* --- CUSTOM DIALOG (MODAL) --- */}
      {isDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setIsDialogOpen(false)}
          />

          {/* Dialog Content */}
          <div className="relative w-full max-w-5xl max-h-[90vh] bg-background rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-border">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b bg-muted/30">
              <div className="flex items-center gap-2">
                {ActiveIcon && <ActiveIcon className="h-5 w-5 text-primary" />}
                <h2 className="text-lg font-bold">
                  All {activeTabInfo?.label} Items
                  <span className="ml-2 text-sm font-normal text-muted-foreground">({allActiveBooks.length})</span>
                </h2>
              </div>
              <button 
                onClick={() => setIsDialogOpen(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Grid */}
            <div className="overflow-y-auto p-6">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {allActiveBooks.map((book) => (
                  <div key={book.id} className="relative group">
                    <BookCard book={book} />
                    {activeTab === 'sold' && (
                      <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] uppercase font-bold px-2 py-1 rounded-md shadow-sm z-10">
                        Sold
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default ProfileOverView;