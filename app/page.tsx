import CatagorySection from '@/components/HomePage/CatagorySection'
import { HeroSection } from '@/components/HomePage/HeroSection'
import { getFeaturedBooks, getRecentBooks } from '@/lib/action/book';
import BookSections from '@/components/HomePage/BookSections';
import CTA from '@/components/HomePage/CTA';
import { Clock, TrendingUp } from 'lucide-react';

const page = async () => {
  const featuredBooks = await getFeaturedBooks(4); //await getFeaturedBooks();
  const recentBooks = await getRecentBooks(8); //await getRecentBooks(4);
  return (
    <div className='min-h-screen bg-background pb-20 md:pb-0'>
      <HeroSection />
      <CatagorySection/>
      {featuredBooks.length > 0 && (
          <BookSections
            Icon={TrendingUp}
            title="Featured Books"
            url="/browse?featured=true"
            books={featuredBooks}
          />
        )}
      <BookSections
        Icon={Clock}
        title="Recently Added"
        url="/browse"
        books={recentBooks}
      />

        <CTA/>
    </div>
  )
}

export default page