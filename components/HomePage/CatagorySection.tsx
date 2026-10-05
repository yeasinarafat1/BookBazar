import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { ArrowRight, BookOpen, Briefcase, Building, Calculator, Cpu, FlaskConical, Languages, Settings, Wrench, Zap } from 'lucide-react'
import { BookCategory } from '@/types';
import { categoryLabels } from '@/data/mockBooks';
import { cn } from '@/lib/utils';
const categoryIcons: Record<BookCategory, React.ElementType> = {
 
  'computer-science': Cpu,
  'electronics': Zap,
  'mechanical': Wrench,
  'civil': Building,
  'electrical': Zap,
  'power': Settings,
  'non-technical': Briefcase,
  'other': BookOpen,
};

const categoryColors: Record<BookCategory, string> = {
  
  'computer-science': 'from-blue-500 to-indigo-500',
  'electronics': 'from-yellow-500 to-orange-500',
  'mechanical': 'from-gray-500 to-slate-600',
  'civil': 'from-green-500 to-emerald-600',
  'electrical': 'from-amber-500 to-yellow-500',
  'power': 'from-red-500 to-rose-600',
  'non-technical': 'from-blue-500 to-indigo-500',
  'other': 'from-gray-500 to-gray-600',
};

const CatagorySection = () => {
    const mainCategories: BookCategory[] = [
    'computer-science', 'electronics', 'mechanical', 'civil',
    'electrical', 'power', 'non-technical', 'other'
  ];
  return (
     <section className="container py-8 mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg sm:text-xl font-bold text-foreground">
              Browse by Category
            </h2>
            <Link href="/browse">
              <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                See all
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className={cn("grid grid-cols-4 gap-3 sm:gap-4")}>
      {mainCategories.map((cat) => {
        const Icon = categoryIcons[cat];
        return (
          <Link
            key={cat}
            href={`/browse?category=${cat}`}
            className="group flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:-translate-y-1"
          >
            <div className={cn(
              "flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl",
              "bg-linear-to-br shadow-lg transition-transform group-hover:scale-110",
              categoryColors[cat]
            )}>
              <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-foreground text-center line-clamp-1">
              {categoryLabels[cat].split(' ')[0]}
            </span>
          </Link>
        );
      })}
    </div>
        </section>
  )
}

export default CatagorySection