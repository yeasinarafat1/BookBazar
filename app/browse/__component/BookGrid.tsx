import { cn } from '@/lib/utils';
import { FileQuestion } from 'lucide-react'; // Optional: consistent icon style
import { BookCard } from '@/components/BookCard';
import { Book } from '@/db/Schemas/book';

interface BookGridProps {
  books: Book[];
  className?: string;
  emptyMessage?: string;
}

export function BookGrid({ books, className, emptyMessage = "No books found" }: BookGridProps) {
  
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
          {/* You can keep your SVG, or use Lucide for consistency: */}
          {/* <FileQuestion className="h-10 w-10 text-muted-foreground" /> */}
          
          <svg className="h-10 w-10 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <p className="text-muted-foreground text-center font-medium">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "grid gap-4 sm:gap-5",
      "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4",
      className
    )}>
      {books.map((book, index) => (
        <div
          key={book.id}
          // "animate-in" is the standard Tailwind CSS Animate utility class often used in Next.js projects
          className="animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <BookCard book={book}  />
        </div>
      ))}
    </div>
  );
}