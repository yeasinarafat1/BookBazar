"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, BookOpen, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAverageRating, getUserReviews } from "@/lib/action/review";

// Define the shape of a single review
export interface ReviewItem {
  id: string;
  reviewerName: string;
  reviewerImage?: string | null;
  rating: number;
  comment: string;
  bookTitle?: string;
  createdAt: Date | string;
}

interface SellerRatingsProps {
  userId: string;
  minimal?: boolean; // If true, only show the average rating without the dialog
}

export default function SellerRatings({ userId, minimal }: SellerRatingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  useEffect(() => {
    // Only fetch if the dialog is opened, or fetch immediately
    // For this case, we'll fetch immediately to show the initial average rating
    const fetchRatingData = async () => {
      setIsLoading(true);
      try {
        // Fetch rating stats and reviews in parallel
        const [ratingStats, userReviews] = await Promise.all([
          getAverageRating(userId),
          getUserReviews(userId),
        ]);

        // Process and set state
        setAverageRating(ratingStats?.data?.average || 0);
        setTotalReviews(ratingStats?.data?.count || 0);

        const formattedReviews = userReviews.data.map((r: any) => ({
          id: r.id,
          reviewerName: r.reviewer.name || "Anonymous",
          reviewerImage: r.reviewer.profilePic,
          rating: r.rating,
          comment: r.feedback,
          createdAt: r.createdAt,
          bookTitle: "Verified Purchase"
        }));
        setReviews(formattedReviews);

      } catch (error) {
        console.error("Failed to fetch seller ratings:", error);
        // Optionally set an error state here
      } finally {
        setIsLoading(false);
      }
    };

    fetchRatingData();
  }, [userId]); // Re-fetch if the userId changes

  // Helper to calculate percentage for the bars
  const getPercentage = (rating: number) => {
    if (totalReviews === 0) return 0;
    const count = reviews.filter((r) => r.rating === rating).length;
    return (count / totalReviews) * 100;
  };

  const getCount = (rating: number) => {
    return reviews.filter((r) => r.rating === rating).length;
  };

  return (
    <>
      {/* --- Trigger Button (The Stats Box) --- */}
      <button
        onClick={() => setIsOpen(true)}
        className="hover:bg-muted/50 p-2 rounded-lg transition-colors cursor-pointer group w-[72px]"
      >
        {isLoading ? (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
        ) : (
            <>
                <div className="flex items-center justify-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                    <span className="text-lg font-bold text-foreground">
                        {averageRating.toFixed(1)}
                    </span>
                </div>
                <p className={minimal ? "hidden" : "text-xs text-muted-foreground"}>Rating</p>
            </>
        )}
      </button>

      {/* --- Dialog Content --- */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-primary/10 via-amber-500/10 to-primary/5 p-6 border-b border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <div className="p-2 rounded-full bg-amber-500/20">
                  <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                </div>
                Reviews & Ratings
              </DialogTitle>
            </DialogHeader>

            {/* Rating Summary */}
            <div className="mt-4 flex items-center gap-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-foreground">
                  {averageRating.toFixed(1)}
                </div>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.round(averageRating)
                          ? "fill-amber-500 text-amber-500"
                          : "text-muted-foreground/30",
                      )}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalReviews} reviews
                </p>
              </div>

              {/* Rating breakdown bars */}
              <div className="flex-1 space-y-1">
                {[5, 4, 3, 2, 1].map((star) => (
                    <div key={star} className="flex items-center gap-2 text-xs">
                      <span className="w-3 text-muted-foreground">{star}</span>
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${getPercentage(star)}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-muted-foreground">
                        {getCount(star)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Reviews List */}
          <ScrollArea className="max-h-[400px]">
            <div className="p-4 space-y-3">
              {isLoading && reviews.length === 0 && (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}

              {!isLoading && reviews.length > 0 && reviews.map((review, index) => (
                <div
                  key={review.id}
                  className={cn(
                    "p-4 rounded-xl bg-card border border-border transition-all hover:shadow-md hover:border-primary/20",
                    index === 0 && "ring-1 ring-primary/10 bg-primary/5",
                  )}
                >
                    <div className="flex items-start gap-3">
                    <Avatar className="h-11 w-11 ring-2 ring-background shadow-sm">
                      <AvatarImage src={review.reviewerImage || undefined} />
                      <AvatarFallback className="bg-linear-to-br from-primary/20 to-amber-500/20 text-primary font-semibold">
                        {review.reviewerName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-semibold text-foreground">
                            {review.reviewerName}
                          </span>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" },
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10">
                          <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          <span className="text-sm font-semibold text-amber-600">
                            {review.rating}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-foreground mt-2 leading-relaxed">
                        "{review.comment}"
                      </p>

                      {review.bookTitle && (
                        <div className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted text-xs text-muted-foreground">
                          <BookOpen className="h-3 w-3" />
                          {review.bookTitle}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {!isLoading && reviews.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <Star className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                  <p className="font-medium">No ratings yet</p>
                  <p className="text-sm mt-1">
                    Complete transactions to receive ratings
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}