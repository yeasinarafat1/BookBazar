import Link from 'next/link'
import React from 'react'
import { Button } from '../ui/button'
import { ArrowRight } from 'lucide-react'

const CTA = () => {
  return (
    <section className="container py-8 pb-12 mx-auto px-4">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary-glow p-8 sm:p-12 text-center">
            <div className="absolute inset-0 opacity-10">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle cx="20" cy="20" r="30" fill="white" />
                <circle cx="80" cy="80" r="40" fill="white" />
              </svg>
            </div>
            <div className="relative">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary-foreground mb-3">
                Have books to sell?
              </h2>
              <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
                List your textbooks in minutes and reach hundreds of students looking for affordable books.
              </p>
              <Link href="/sell">
                <Button variant="secondary" size="lg" className="gap-2 bg-card text-foreground hover:bg-card/90 cursor-pointer">
                  Start Selling
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
  )
}

export default CTA