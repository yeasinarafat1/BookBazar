'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  CheckCircle, Edit, Heart, LogOut, MessageCircle, 
  Package, Settings, Shield, ShoppingBag, ChevronRight 
} from "lucide-react";
import { BookCard } from "@/components/BookCard";
import { mockBooks } from "@/data/mockBooks";
import { cn } from "@/lib/utils";
import { TabType } from "@/types"; // Ensure this type exists or use string

const ProfileOverView = () => {

  const [activeTab, setActiveTab] = useState<TabType>('listings');


  const userListings = mockBooks.slice(0, 3);
  const soldBooks = mockBooks.slice(3, 5);
  const purchasedBooks = mockBooks.slice(5, 8);
  const savedBooks = mockBooks.slice(8, 10);


  const tabs = [
    { id: 'listings' as TabType, label: 'Listed', icon: Package, count: userListings.length },
    { id: 'sold' as TabType, label: 'Sold', icon: CheckCircle, count: soldBooks.length },
    { id: 'purchased' as TabType, label: 'Purchased', icon: ShoppingBag, count: purchasedBooks.length },
    { id: 'saved' as TabType, label: 'Saved', icon: Heart, count: savedBooks.length },
  ];




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
      case 'listings': return "You haven't listed any books yet";
      case 'sold': return "No books sold yet";
      case 'purchased': return "You haven't purchased any books yet";
      case 'saved': return "You haven't saved any books yet";
      default: return "No books found";
    }
  };

  const activeBooks = getActiveBooks();

  return (
    <div className="w-full">
      {/* Tabs Navigation */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-w-fit",
              activeTab === tab.id
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="text-xs">({tab.count})</span>
          </button>
        ))}
      </div>

      {/* Books Grid Content */}
      {activeBooks.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {activeBooks.map((book) => (
            <div key={book.id} className="relative">
              <BookCard book={book} />
              {activeTab === 'sold' && (
                <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium z-10">
                  Sold
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-muted-foreground mb-8">
          <p>{getEmptyMessage()}</p>
        </div>
      )}

     
    </div>
  );
};

export default ProfileOverView;