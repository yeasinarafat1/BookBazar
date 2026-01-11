// app/browse/BrowseContent.tsx
'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
// Fixed imports based on your previous file structure
import { BookCategory, BookCondition } from '@/types';
// Note: You might need to import the 'Book' type definition derived from Drizzle or your types file
import { Book } from '@/db/Schemas/book'; // Example path, adjust to where your types are
import { SearchFilter } from './__component/SearchFilter';
import { BookGrid } from './__component/BookGrid';

interface BrowseContentProps {
  initialBooks: Book[];
}

export const BrowseContent = ({ initialBooks }: BrowseContentProps) => {
  const searchParams = useSearchParams();

  // 1. Derive filters directly from URL params
  const currentFilters = {
    searchQuery: searchParams.get('q') || '',
    category: (searchParams.get('category') as BookCategory) || undefined,
    condition: (searchParams.get('condition') as BookCondition) || undefined,
    minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
    maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
    semester: searchParams.get('semester') ? Number(searchParams.get('semester')) : undefined,
  };

  // 2. Filter books based on the derived URL params
  // Using 'initialBooks' (from DB) instead of 'mockBooks'
  const filteredBooks = useMemo(() => {
    return initialBooks.filter((book) => {
      const { searchQuery, category, condition, minPrice, maxPrice, semester } = currentFilters;

      // Search query (Title or Author)
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const title = book.title?.toLowerCase() || '';
        const author = book.author?.toLowerCase() || '';
        
        const matchesTitle = title.includes(query);
        const matchesAuthor = author.includes(query);
        
        if (!matchesTitle && !matchesAuthor) return false;
      }
      
      // Category
      if (category && book.category !== category) return false;
      
      // Condition
      if (condition && book.condition !== condition) return false;
      
      // Price range
      if (minPrice !== undefined && book.price < minPrice) return false;
      if (maxPrice !== undefined && book.price > maxPrice) return false;
      
      // Semester
      // Ensure types match (string vs number) depending on your DB schema
      if (semester !== undefined && Number(book.semester) !== semester) return false;
      
      return true;
    });
  }, [currentFilters, initialBooks]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0 flex flex-col">
      <main className="container mx-auto px-4 py-6 flex-1">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Browse Books</h1>
          <p className="text-muted-foreground">
            {filteredBooks.length} books available
          </p>
        </div>
        
        <SearchFilter className="mb-6" />
        
        <BookGrid 
          books={filteredBooks}
          emptyMessage="No books match your filters. Try adjusting your search criteria."
        />
      </main>
    </div>
  );
};