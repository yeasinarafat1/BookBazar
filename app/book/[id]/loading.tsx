import React from 'react';

const BookPageSkeleton = () => {
  return (
    <main className="pb-24 md:pb-8">
      {/* Image Slider Skeleton */}
      <div className="relative bg-white border-b border-gray-200">
        <div className="container px-0 md:px-4">
          <div className="relative w-full md:w-5/7 h-87.5 md:h-125 overflow-hidden rounded-none md:rounded-lg bg-gray-100">
            {/* Blurred background placeholder */}
            <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            
            {/* Main image placeholder */}
            <div className="relative h-full w-full flex items-center justify-center z-10">
              <div className="w-48 h-48 bg-gray-300 rounded-lg animate-pulse" />
            </div>

            {/* Back button skeleton */}
            <div className="absolute left-4 top-4 z-20 h-10 w-10 rounded-full bg-gray-300 animate-pulse" />

            {/* Action buttons skeleton */}
            <div className="absolute right-4 top-4 z-20 flex gap-2">
              <div className="h-10 w-10 rounded-full bg-gray-300 animate-pulse" />
              <div className="h-10 w-10 rounded-full bg-gray-300 animate-pulse" />
            </div>

            {/* Navigation dots skeleton */}
            <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2 flex gap-2 p-2 rounded-full bg-black/20">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-2 w-2 rounded-full bg-white/50" />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title Section Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              {/* Badges skeleton */}
              <div className="flex flex-wrap gap-2 mb-4">
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
              </div>

              {/* Title skeleton */}
              <div className="h-9 w-3/4 bg-gray-200 rounded-lg mb-2 animate-pulse" />
              
              {/* Author skeleton */}
              <div className="h-6 w-1/3 bg-gray-200 rounded-lg mb-6 animate-pulse" />

              {/* Price skeleton */}
              <div className="flex items-baseline gap-3 mb-6">
                <div className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-6 w-16 bg-gray-200 rounded-full animate-pulse" />
              </div>

              {/* Meta info skeleton */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-gray-100">
                <div className="h-5 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-20 bg-gray-200 rounded animate-pulse" />
                <div className="h-5 w-28 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="h-6 w-32 bg-gray-200 rounded-lg mb-3 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
            </div>

            {/* Condition Details Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="h-6 w-40 bg-gray-200 rounded-lg mb-4 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse mt-0.5" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                      <div className="h-4 w-48 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Seller Card Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="h-4 w-16 bg-gray-200 rounded mb-4 animate-pulse" />
              
              {/* Seller info skeleton */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-14 w-14 rounded-full bg-gray-200 animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-28 bg-gray-200 rounded animate-pulse" />
                </div>
              </div>

              {/* Buttons skeleton */}
              <div className="h-10 w-full bg-gray-200 rounded-lg mb-3 animate-pulse" />
              
              <div className="space-y-2 mt-4">
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-10 w-full bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>

            {/* Safety Tips Skeleton */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <div className="h-6 w-28 bg-gray-200 rounded-lg mb-4 animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse mt-0.5" />
                    <div className="h-4 flex-1 bg-gray-200 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default BookPageSkeleton;