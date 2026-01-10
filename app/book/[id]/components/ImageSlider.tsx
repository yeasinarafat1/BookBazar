"use client";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  Share2,
} from "lucide-react";
import React, { useState } from "react";

const ImageSlider = ({ images }: { images: string[] }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  return (
    <div className="relative bg-white border-b border-gray-200">
      <div className="container">
        <div className="relative aspect-4/3 md:aspect-video max-h-125 overflow-hidden">
          <img
            src={images[currentImageIndex]}
            alt="Book"
            className="h-full w-full object-cover"
          />

          {/* Back Button */}
          <button className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110">
            <ArrowLeft className="h-5 w-5 text-gray-700" />
          </button>

          {/* Action Buttons */}
          <div className="absolute right-4 top-4 flex gap-2">
            <button
              onClick={() => setIsLiked(!isLiked)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110"
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  isLiked && "fill-red-500 text-red-500"
                )}
              />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110">
              <Share2 className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Image Navigation */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex((i) => Math.max(0, i - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110 disabled:opacity-50"
                disabled={currentImageIndex === 0}
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={() =>
                  setCurrentImageIndex((i) =>
                    Math.min(images.length - 1, i + 1)
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-all hover:scale-110 disabled:opacity-50"
                disabled={currentImageIndex === images.length - 1}
              >
                <ChevronRight className="h-5 w-5 text-gray-700" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={cn(
                      "h-2 rounded-full transition-all",
                      i === currentImageIndex
                        ? "bg-white w-8"
                        : "bg-white/60 w-2 hover:bg-white/80"
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
