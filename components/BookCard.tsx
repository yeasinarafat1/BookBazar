
import {  BookCondition } from '@/types';
import { Badge } from '@/components/ui/badge';
import { conditionLabels } from '@/data/mockBooks';
import { MapPin, Eye, Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';
import { Book } from '@/db/Schemas/book';

interface BookCardProps {
  book: Book;
  className?: string;
}

const conditionVariants: Record<BookCondition, 'new' | 'like-new' | 'good' | 'fair'> = {
  'new': 'new',
  'like-new': 'like-new',
  'good': 'good',
  'fair': 'fair',
};

export function BookCard({ book, className }: BookCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const discount = book.price 
    ? Math.round((1 - book.price / book.price) * 100)
    : 0;

  return (
    <Link
      href={`/book/${book.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card border border-border/50",
        "shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1",
        className
      )}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        {!imageLoaded && (
          <div className="absolute inset-0 animate-pulse bg-muted" />
        )}
        <img
          src={book.images[0]}
          alt={book.title}
          className={cn(
            "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
            imageLoaded ? "opacity-100" : "opacity-0"
          )}
          onLoad={() => setImageLoaded(true)}
          loading="lazy"
        />
        
        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Like Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsLiked(!isLiked);
          }}
          className={cn(
            "absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full",
            "bg-card/90 backdrop-blur-sm shadow-sm transition-all duration-200",
            "hover:scale-110 active:scale-95",
            isLiked && "text-red-500"
          )}
        >
          <Heart className={cn("h-4 w-4", isLiked && "fill-current")} />
        </button>
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          <Badge variant={conditionVariants[book.condition as BookCondition]} className="font-bold">
            {conditionLabels[book.condition as BookCondition]}
          </Badge>
          {discount > 0 && (
            <Badge variant="accent" className="font-bold">
              {discount}% OFF
            </Badge>
          )}
        </div>
        
        {/* Featured Badge */}
        {true && (
          <div className="absolute bottom-3 left-3">
            <Badge variant="default" className="bg-primary/90 backdrop-blur-sm">
              Featured
            </Badge>
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Title */}
        <h3 className="font-semibold text-foreground line-clamp-2 leading-tight mb-1 group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        
        {/* Author */}
        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
          by {book.author}
        </p>
        
        {/* Price */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-lg font-bold text-primary">
            ৳{book.price}
          </span>
          {book.price && (
            <span className="text-sm text-muted-foreground line-through">
              ৳{book.price}
            </span>
          )}
        </div>
        
        {/* Meta Info */}
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            <span className="truncate max-w-[100px]">{book.location.split(' - ')[0]}</span>
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {100}
          </span>
        </div>
      </div>
    </Link>
  );
}
