"use client";

import { useState } from "react";
import { UserProfile } from "@clerk/nextjs";
import { User, Settings2, UserCog } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("account");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
      </div>

      {/* Custom Tabs Container */}
      <div className="w-full flex flex-col items-center">
        
        {/* Tab Navigation */}
        <div className="flex p-1 bg-gray-100 rounded-lg mb-8">
          <button
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "account"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <User className="h-4 w-4" />
            Account
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex items-center gap-2 px-6 py-2.5 text-sm font-medium rounded-md transition-all ${
              activeTab === "preferences"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Settings2 className="h-4 w-4" />
            Preferences
          </button>
        </div>

        {/* Tab 1: Clerk Account Management */}
        {activeTab === "account" && (
          <div className="w-full animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
              <UserProfile 
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "w-full shadow-none",
                    card: "w-full shadow-md border border-gray-200 rounded-xl",
                    navbar: "hidden md:flex",
                    scrollBox: "max-h-[600px]" 
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Your Custom App Preferences */}
        {activeTab === "preferences" && (
          <div className="w-full max-w-3xl animate-in fade-in zoom-in duration-300">
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              
              {/* Card Header */}
              <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-center gap-2 mb-1">
                  <UserCog className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-xl font-semibold text-gray-900">App Preferences</h2>
                </div>
                <p className="text-sm text-gray-500">
                  Manage your selling defaults and privacy settings for BookBazar.
                </p>
              </div>

              {/* Card Content */}
              <div className="p-6 space-y-6">
                
                {/* Input Field */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Default Pickup Location</label>
                  <input 
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all" 
                    placeholder="e.g. Main Library Gate" 
                  />
                  <p className="text-xs text-gray-500">This will auto-fill when you sell a book.</p>
                </div>

                <hr className="border-gray-100" />

                {/* Toggle / Checkbox */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-base font-medium text-gray-900">Show Phone Number</label>
                    <p className="text-sm text-gray-500">
                      Allow other students to see your phone number on listings.
                    </p>
                  </div>
                  
                  {/* Custom Toggle Switch using Checkbox */}
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                     <label className="text-base font-medium text-gray-900">Enable WhatsApp</label>
                     <p className="text-sm text-gray-500">
                       Show a WhatsApp button on your profile.
                     </p>
                  </div>
                   <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

              </div>
              
              {/* Card Footer */}
              <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                 <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    Cancel
                 </button>
                 <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700">
                    Save Changes
                 </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}