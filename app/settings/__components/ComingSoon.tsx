"use client";

import { Settings2, Clock } from "lucide-react";

export default function ComingSoon() {
  return (
    <div className="w-full max-w-3xl animate-in fade-in zoom-in duration-300">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        
        {/* Card Header */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2 mb-1">
            <Settings2 className="h-5 w-5 text-emerald-600" />
            <h2 className="text-xl font-semibold text-gray-900">App Preferences</h2>
          </div>
          <p className="text-sm text-gray-500">
            Manage your selling defaults and privacy settings for BookBazar.
          </p>
        </div>

        {/* Card Content - Coming Soon */}
        <div className="p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
            <Clock className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-500 max-w-sm">
            We&apos;re working hard to bring you app preferences. This feature will be available soon!
          </p>
        </div>
        
        {/* Card Footer */}
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-center">
          <span className="text-sm text-gray-500">
            Stay tuned for updates
          </span>
        </div>

      </div>
    </div>
  );
}
