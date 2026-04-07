import { Metadata } from "next";
import { notFound } from "next/navigation";

// --- Components ---
import ImageSlider from "./components/ImageSlider";
import SellerCard from "./components/SellerCard";
import SafetyTips from "./components/SafetyTips";
import BookConditionDetails from "./components/BookConditionDetails";
import SellerActions from "./components/SellerAction";

// --- UI & Icons ---
import { Badge } from "@/components/ui/badge";
import { Clock, Eye, MapPin, ArchiveX } from "lucide-react"; // Added ArchiveX
import { cn } from "@/lib/utils"; // Import cn utility

// --- Actions ---
import { getBookBySlug } from "@/lib/action/book";
import { getLoggedInUser } from "@/lib/action/user";
import { checkActiveContract } from "@/lib/action/contract";

interface BookPageProps {
  params: Promise<{
    id: string;
  }>;
}

const conditionLabels = {
  new: "New",
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
};

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://book-bazar-phi.vercel.app/";

// --- Metadata Generator ---
export async function generateMetadata({
  params,
}: BookPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const book = await getBookBySlug(resolvedParams.id);

  if (!book) {
    return {
      title: "Book Not Found",
      description: "The requested book could not be found in our store.",
    };
  }

  const ogImages = book.images.map((img) =>
    img.startsWith("http") ? img : `${baseUrl}${img}`,
  );

  const statusText = book.isSold ? "[SOLD] " : "";
  const pageTitle = `${statusText}${book.title} by ${book.author} | Campus Bookstore`;
  const pageDescription = `Buy "${book.title}" (${book.category}) for ৳${book.price}. Condition: ${book.condition}. Available now from ${book.sellerName}.`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [book.title, book.author, book.category, "used books", "campus bookstore", book.condition],
    authors: [{ name: book.author }],
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `${baseUrl}/books/${book.slug}`,
      siteName: "Campus Bookstore",
      locale: "en_US",
      type: "website",
      images: [
        { url: ogImages[0], width: 1200, height: 630, alt: `${book.title} cover image` },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: ogImages,
    },
  };
}

// --- Main Page Component ---
export default async function BookPage({ params }: BookPageProps) {
  const { user } = await getLoggedInUser();
  const id = (await params).id;
  
  // 1. Fetch Book Data
  const book = await getBookBySlug(id);
  
  if (!book) {
    return notFound();
  }

  // 2. Fetch Contract Data (for seller view)
  const activeContractCheck = await checkActiveContract(book.id || "");
  const activeContract = activeContractCheck.exists ? activeContractCheck.contract : null;

  const discount = book.price
    ? Math.round((1 - book.price / book.price) * 100) // Note: Logic seems to always be 0 based on provided code, kept as is.
    : 0;

  const formatDate = (date: Date) => {
    const d = new Date(date);
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      Math.ceil((d.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day",
    );
  };

  return (
    <main className="pb-24 md:pb-8">
      <ImageSlider
        images={book.images}
        bookId={book.id}
        sellerId={book.sellerId}
      />
      
      <div className="container px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          
          {/* --- LEFT COLUMN: Main Content --- */}
          <div className="lg:col-span-2 space-y-6">
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
              <p className="text-lg text-gray-600 mb-6">by {book.author}</p>

              {/* --- UPDATED PRICE SECTION --- */}
              <div className="flex items-center gap-3 mb-6">
                <span 
                  className={cn(
                    "text-4xl font-bold",
                    book.isSold ? "text-gray-400 line-through decoration-2" : "text-emerald-600"
                  )}
                >
                  ৳{book.price}
                </span>

                {book.isSold ? (
                  // Case 1: Sold
                  <Badge variant="destructive" className="text-base px-4 py-1 h-9 pointer-events-none">
                    Sold Out
                  </Badge>
                ) : (
                  // Case 2: Available
                  book.price && (
                    <>
                      {/* Optional: Original Price if you have it */}
                      {/* <span className="text-xl text-gray-400 line-through">৳{originalPrice}</span> */}
                      
                      {/* Discount Badge (Logic kept from snippet) */}
                      <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 border-0 px-3 py-1 font-semibold">
                        Save {discount}%
                      </Badge>
                    </>
                  )
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
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Description
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {book.description}
              </p>
            </div>

            {/* Book Condition Details */}
            <BookConditionDetails />
          </div>

          {/* --- RIGHT COLUMN: Sidebar --- */}
          <div className="space-y-4">
            
            {/* Logic for Seller vs Buyer vs Sold */}
            {book.sellerId === user?.id ? (
              // CASE 1: I am the Seller (Show Actions)
              <SellerActions
                bookId={book.id}
                sellerId={book.sellerId}
                currentPrice={book.price}
                activeContract={activeContract || null}
                isSold={book.isSold}
              />
            ) : book.isSold ? (
              // CASE 2: Book is Sold (And I am NOT seller) -> Show Sold Card
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="h-14 w-14 bg-gray-200 rounded-full flex items-center justify-center">
                   <ArchiveX className="h-7 w-7 text-gray-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">Item Sold</h3>
                  <p className="text-sm text-gray-500 mt-1 max-w-[200px] mx-auto">
                    This book is no longer available for purchase.
                  </p>
                </div>
              </div>
            ) : (
              // CASE 3: Book Available (And I am Buyer) -> Show Contact Card
              <SellerCard
                sellerId={book.sellerId}
                SellerUsername={book.seller.username || ""}
                SellerName={book.seller.name || ""}
                whatsapp={book.sellerWhatsapp}
                contactNumber={book.sellerPhone || ""}
              />
            )}

            {/* Safety Tips */}
            <SafetyTips />
          </div>
        </div>
      </div>
    </main>
  );
}