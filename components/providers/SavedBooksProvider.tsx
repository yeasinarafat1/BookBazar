"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

// Define the shape of our context
interface SavedBooksContextType {
  savedBookIds: string[];
  toggleBook: (bookId: string) => void;
  isBookSaved: (bookId: string) => boolean;
}

const SavedBooksContext = createContext<SavedBooksContextType | undefined>(undefined);

// Provider Component
export const SavedBooksProvider = ({ 
  children, 
  initialSavedIds = [] 
}: { 
  children: React.ReactNode; 
  initialSavedIds: string[];
}) => {
  const [savedBookIds, setSavedBookIds] = useState<string[]>(initialSavedIds);

  // Sync state if the server prop updates (e.g. on page refresh)
  useEffect(() => {
    setSavedBookIds(initialSavedIds);
  }, [initialSavedIds]);

  const isBookSaved = (bookId: string) => {
    return savedBookIds.some(id => String(id).toLowerCase() === String(bookId).toLowerCase());
  };

  // Helper to optimistically update the UI instantly
  const toggleBook = (bookId: string) => {
    setSavedBookIds((prev) => {
      const isSaved = prev.some(id => String(id).toLowerCase() === String(bookId).toLowerCase());
      if (isSaved) {
        return prev.filter(id => String(id).toLowerCase() !== String(bookId).toLowerCase());
      } else {
        return [...prev, bookId];
      }
    });
  };

  return (
    <SavedBooksContext.Provider value={{ savedBookIds, toggleBook, isBookSaved }}>
      {children}
    </SavedBooksContext.Provider>
  );
};

// Custom Hook for easy access
export const useSavedBooks = () => {
  const context = useContext(SavedBooksContext);
  if (!context) {
    throw new Error("useSavedBooks must be used within a SavedBooksProvider");
  }
  return context;
};