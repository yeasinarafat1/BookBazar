'use client';

import { useState } from "react";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toggleSaveBook } from "@/lib/action/save";
import { useCurrentUser } from "@/lib/hook/user"; 
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSavedBooks } from "@/components/providers/SavedBooksProvider"; // Import Hook

interface LikeButtonProps {
  bookId: string;
  sellerId: string;
  // initialIsLiked removed -> We don't need it anymore!
  className?: string;
  iconClassName?: string;
}

export const LikeButton = ({ 
  bookId, 
  sellerId, 
  className,
  iconClassName 
}: LikeButtonProps) => {
  const { isBookSaved, toggleBook } = useSavedBooks(); // Use Context
  const isLiked = isBookSaved(bookId); // Check status from Context
  const [isSaving, setIsSaving] = useState(false);
  
  const { user } = useCurrentUser();
  const { toast } = useToast();
  const pathname = usePathname();

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!user) {
      toast({ title: "Please sign in to save books", variant: "destructive" });
      return;
    }
    
    if (user.id === sellerId) return;
    if (isSaving) return;

    // 1. Optimistic Update via Context (Instantly updates UI)
    toggleBook(bookId); 
    setIsSaving(true);

    try {
      // 2. Server Action
      const result = await toggleSaveBook(bookId, pathname);

      if (result.success) {
        toast({
          title: result.isSaved ? "Saved" : "Removed",
          description: result.message,
        });
        // Context is already updated optimistically, so we are good.
      } else {
        // Revert on error
        toggleBook(bookId); 
        toast({ title: "Error", variant: "destructive" });
      }
    } catch (error) {
      toggleBook(bookId); // Revert
    } finally {
      setIsSaving(false);
    }
  };

  if (user && user.id === sellerId) return null;

  return (
    <button
      onClick={handleToggleSave}
      disabled={isSaving}
      className={cn(
        "flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 disabled:opacity-70",
        "bg-white/90 shadow-sm backdrop-blur-sm hover:scale-110",
        className
      )}
    >
      <Heart
        className={cn(
          "transition-colors duration-300",
          isLiked ? "fill-red-500 text-red-500" : "text-gray-700",
          iconClassName || "h-4 w-4"
        )}
      />
    </button>
  );
};