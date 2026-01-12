import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { ArrowRight, LucideIcon, LucideProps } from 'lucide-react'
import { BookGrid } from '@/app/browse/__component/BookGrid'
import { Book } from '@/db/Schemas/book'

const BookSections = ({Icon,title,url,books}:{
    Icon:LucideIcon;
    title:string;
    url:string,
    books:Book[]
}) => {
  return (
    <section className="container py-8 mx-auto px-4">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <h2 className="text-lg sm:text-xl font-bold text-foreground">
                      {title}
                    </h2>
                  </div>
                  <Link href={url}>
                    <Button variant="ghost" size="sm" className="gap-1 text-muted-foreground">
                      View all
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <BookGrid books={books} />
              </section>
  )
}

export default BookSections