
import { getVerifiedAndUnsoldBooks } from '@/lib/action/book';

import { BookCategory, BookCondition } from '@/types';
import { BookGrid } from './__component/BookGrid';
import { SearchFilter } from './__component/SearchFilter';

interface BrowsePageProps {

  searchParams: Promise<{ q?: string , featured?: string , category?: string, condition?: string, minPrice?: string, maxPrice?: string, semester?: string }>;
}

export default async function BrowsePage({searchParams}: BrowsePageProps) {
  const params = await searchParams;
   const currentFilters = {
     searchQuery: params.q || '',
     category: (params.category as BookCategory) || undefined,
     condition: (params.condition as BookCondition) || undefined,
     minPrice: params.minPrice ? Number(params.minPrice) : undefined,
     maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
     semester: params.semester ? Number(params.semester) : undefined,
     // NEW: Check if "featured=true" is in the URL
     featured: params.featured === 'true', 
   };
 
  const initialBooks = await getVerifiedAndUnsoldBooks(currentFilters);

  return (
    // YOU MUST KEEP THIS SUSPENSE BOUNDARY
    
        <div className="min-h-screen bg-background pb-20 md:pb-0 flex flex-col">
            <main className="container mx-auto px-4 py-6 flex-1">
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-foreground mb-1">
                   Browse Books
                </h1>
                <p className="text-muted-foreground">
                  {initialBooks.length} books available
                </p>
              </div>
              
              {/* SearchFilter still needed to UPDATE the URL when user types/selects */}
              <SearchFilter className="mb-6" />
              
              {/* Render books directly */}
              <BookGrid 
                books={initialBooks}
                emptyMessage="No books match your filters. Try adjusting your search criteria."
              />
            </main>
          </div>
   
  );
}