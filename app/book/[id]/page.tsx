import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { mockBooks } from '@/data/mockBooks';

import { Book } from '@/types';
import { getBookById } from '@/lib/action/book';
import ImageSlider from './components/ImageSlider';
import SellerCard from './components/SellerCard';
import SafetyTips from './components/SafetyTips';
import BookConditionDetails from './components/BookConditionDetails';
import { Badge, Clock, Eye, MapPin } from 'lucide-react';

interface BookPageProps {
 params: Promise<{
    id: string;
  }>;
}
const conditionLabels = {
  'new': 'New',
  'like-new': 'Like New',
  'good': 'Good',
  'fair': 'Fair'
};

const conditionVariants = {
  'new': 'default',
  'like-new': 'secondary',
  'good': 'outline',
  'fair': 'outline'
};

// Optional: Generate SEO Metadata dynamically
export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const book = await getBookById((await params).id);
  

  if (!book) {
    return { title: 'Book Not Found' };
  }

  return {
    title: `${book.title} | Campus Bookstore`,
    description: `Buy ${book.title} by ${book.author} for ৳${book.price}. Condition: ${book.condition}.`,
  };
}

export default async function BookPage({ params }: BookPageProps) {

  const book = await getBookById((await params).id);

  if (!book) {
   
    return notFound();
  }

  const discount = book.price 
    ? Math.round((1 - book.price / book.price) * 100) 
    : 0;

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return new Intl.RelativeTimeFormat('en', { numeric: 'auto' }).format(
      Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      'day'
    );
  }
  // 3. Pass data to Client Component
  return <main className="pb-24 md:pb-8">
    <ImageSlider images={book.images} />
    <div className="container px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title Section */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-0 px-3 py-1">
                    {conditionLabels[book.condition as keyof typeof conditionLabels]}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100 border-0 px-3 py-1">
                    {book.category}
                  </Badge>
                  {book.semester && (
                    <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-0 px-3 py-1">
                      Semester {book.semester}
                    </Badge>
                  )}
                </div>

                {/* Title & Author */}
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {book.title}
                </h1>
                <p className="text-lg text-gray-600 mb-6">
                  by {book.author}
                </p>

                {/* Price */}
                <div className="flex items-baseline gap-3 mb-6">
                  <span className="text-4xl font-bold text-emerald-600">
                    ৳{book.price}
                  </span>
                  {book.price && (
                    <>
                      <span className="text-xl text-gray-400 line-through">
                        ৳{book.price}
                      </span>
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 px-3 py-1 font-semibold">
                        Save {discount}%
                      </Badge>
                    </>
                  )}
                </div>

                {/* Meta Info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-4 border-t border-gray-100">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {book.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-gray-400" />
                    {100} views
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {formatDate(book.createdAt)}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                <p className="text-gray-700 leading-relaxed">
                  {book.description}
                </p>
              </div>

              {/* Book Condition Details */}
              <BookConditionDetails/>
            </div>

          
            <div className="space-y-4">
              {/* Seller Card */}
              <SellerCard SellerName={book.sellerName} whatsapp={book.sellerWhatsapp} contactNumber={book.sellerPhone || ""} />

              {/* Safety Tips */}
              <SafetyTips/>
            </div>
          </div>
        </div>
    </main>;
}