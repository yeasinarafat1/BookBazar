"use client";

import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
} from "lucide-react";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { toggleSaveBook, checkIsBookSaved } from "@/lib/action/save";
import { usePathname, useRouter } from "next/navigation";
import { LikeButton } from "@/components/LikeButton";

interface ImageSliderProps {
  images: string[];
  bookId: string;
  sellerId: string;
}

const ImageSlider = ({ images, bookId, sellerId }: ImageSliderProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);


  const { toast } = useToast();
  const router = useRouter();

  // 1. Check if book is already saved on mount


  // 2. Handle Save (Heart Click)
 
  // 3. Handle Share (Copy Link)
  const handleShare = async () => {
    try {
      // Constructs the full URL (e.g., https://your-site.com/book/123)
      const url = `${window.location.origin}/book/${bookId}`;
      await navigator.clipboard.writeText(url);

      toast({
        title: "Link Copied",
        description: "The book link has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative bg-white border-b border-gray-200">
      <div className="container px-0 md:px-4">
        {/* Changed to fixed height instead of aspect-ratio to prevent layout shifts */}
        <div className="relative w-full md:w-5/7 h-87.5 md:h-125 overflow-hidden rounded-none md:rounded-lg bg-gray-100 group">
          {/* LAYER 1: Blurred Background Image (Fills the space) */}
          <div
            className="absolute inset-0 bg-cover bg-center blur-xl opacity-50 scale-110"
            style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
          />

          {/* LAYER 2: The Actual Image (Contained, not cropped) */}
          <Image
            fill
            src={images[currentImageIndex]}
            alt="Book Preview"
            className="relative h-full w-full object-contain z-10"
            priority // Load first image immediately
          />

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="absolute left-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110"
          >
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>

          {/* Action Buttons */}
          <div className="absolute right-4 top-4 z-20 flex gap-2">
            <LikeButton
            key={bookId}
              bookId={bookId}
              sellerId={sellerId}
              className="h-10 w-10" // Larger size for slider
              iconClassName="h-5 w-5"
            />
            <button
              onClick={handleShare}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110"
            >
              <Share2 className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex((i) => Math.max(0, i - 1))}
                className="absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                disabled={currentImageIndex === 0}
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex((i) =>
                    Math.min(images.length - 1, i + 1),
                  )
                }
                className="absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-all hover:scale-110 disabled:opacity-50 disabled:hover:scale-100"
                disabled={currentImageIndex === images.length - 1}
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>

              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-black/20 backdrop-blur-md">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={cn(
                      "h-2 rounded-full transition-all shadow-sm",
                      i === currentImageIndex
                        ? "bg-white w-6"
                        : "bg-white/50 w-2 hover:bg-white/80",
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
