"use client";

import { useState } from "react";
import { UserProfile } from "@clerk/nextjs";
import { User, Settings2 } from "lucide-react";
import ComingSoon from "./__components/ComingSoon";
// import Preferences from "./__components/Preferences"; // Uncomment when ready to use

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
          <ComingSoon />
          /* Uncomment below and remove ComingSoon when ready to develop:
          <Preferences />
          */
        )}
      </div>
    </div>
  );
}