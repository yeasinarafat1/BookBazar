'use client';

import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookCategory, BookCondition } from '@/types';
import { categoryLabels, conditionLabels } from '@/data/mockBooks';
import { useState, useCallback, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useSearchParams, usePathname, useRouter } from 'next/navigation';
// 1. Import the hook from the package
import { useDebounce } from 'use-debounce';

interface SearchFilterProps {
  className?: string;
}

export function SearchFilter({ className }: SearchFilterProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();
  
  const [showFilters, setShowFilters] = useState(false);

  // Local state for the input field to allow instant typing
  const [localSearchQuery, setLocalSearchQuery] = useState(searchParams.get('q') || '');
  
  // 2. Use the package hook (it returns an array: [value, controlFunctions])
  const [debouncedSearchQuery] = useDebounce(localSearchQuery, 300);

  // Helper to update URL parameters (Memoized)
  const updateURL = useCallback((key: string, value: string | number | null | undefined) => {
    const params = new URLSearchParams(searchParams);
    
    if (value === null || value === undefined || value === '') {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, pathname, replace]);

  // 3. Effect: Sync URL when the *debounced* value changes
  useEffect(() => {
    const currentParam = searchParams.get('q') || '';
    // Only update if the value actually changed to avoid redundant pushes
    if (debouncedSearchQuery !== currentParam) {
      updateURL('q', debouncedSearchQuery);
    }
  }, [debouncedSearchQuery, updateURL, searchParams]);

  // 4. Effect: Sync local state if the URL changes externally (e.g. Back Button)
  useEffect(() => {
    const paramQuery = searchParams.get('q') || '';
    if (paramQuery !== localSearchQuery && paramQuery !== debouncedSearchQuery) {
       setLocalSearchQuery(paramQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]); 

  // Clear all filters
  const clearFilters = () => {
    const params = new URLSearchParams(searchParams);
    const query = params.get('q');
    
    const keys = Array.from(params.keys());
    keys.forEach(key => params.delete(key));
    
    if (query) params.set('q', query);
    
    replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const activeFilterCount = [
    searchParams.get('category'),
    searchParams.get('condition'),
    searchParams.get('minPrice') || searchParams.get('maxPrice'),
    searchParams.get('semester'),
  ].filter(Boolean).length;

  const categories: BookCategory[] = [
     'computer-science', 'electronics', 'mechanical',
    'civil', 'electrical', 'power','non-technical'
  ];
  const conditions: BookCondition[] = ['new', 'like-new', 'good', 'fair'];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search books, authors..."
            // Controlled component linked to local state
            value={localSearchQuery} 
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button
          variant={showFilters ? 'secondary' : 'outline'}
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="default" className="h-5 w-5 p-0 justify-center text-[10px]">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>
      
      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-xl border border-border bg-card p-4 space-y-4 animate-in slide-in-from-top-2 fade-in duration-200">
          {/* Categories */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-foreground">Category</h4>
              {searchParams.get('category') && (
                <button
                  onClick={() => updateURL('category', null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => {
                const isActive = searchParams.get('category') === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => updateURL('category', isActive ? null : cat)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-secondary/50"
                    )}
                  >
                    {categoryLabels[cat]}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-foreground">Condition</h4>
              {searchParams.get('condition') && (
                <button
                  onClick={() => updateURL('condition', null)}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {conditions.map((cond) => {
                const isActive = searchParams.get('condition') === cond;
                return (
                  <button
                    key={cond}
                    onClick={() => updateURL('condition', isActive ? null : cond)}
                    className={cn(
                      "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-secondary/50"
                    )}
                  >
                    {conditionLabels[cond]}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Price Range */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Price Range (৳)</h4>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min"
                defaultValue={searchParams.get('minPrice')?.toString()}
                onChange={(e) => updateURL('minPrice', e.target.value)}
                className="h-9"
              />
              <span className="text-muted-foreground">—</span>
              <Input
                type="number"
                placeholder="Max"
                defaultValue={searchParams.get('maxPrice')?.toString()}
                onChange={(e) => updateURL('maxPrice', e.target.value)}
                className="h-9"
              />
            </div>
          </div>
          
          {/* Semester */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Semester</h4>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => {
                const isActive = searchParams.get('semester') === String(sem);
                return (
                  <button
                    key={sem}
                    onClick={() => updateURL('semester', isActive ? null : sem)}
                    className={cn(
                      "h-8 w-8 rounded-full text-xs font-medium transition-all flex items-center justify-center border",
                      isActive
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:bg-secondary/50"
                    )}
                  >
                    {sem}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Clear All */}
          {activeFilterCount > 0 && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="w-full gap-2 text-muted-foreground hover:text-destructive"
            >
              <X className="h-4 w-4" />
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
}