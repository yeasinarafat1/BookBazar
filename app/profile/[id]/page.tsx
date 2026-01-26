import Link from "next/link";
import Image from "next/image";
import { 
  User, 
  Calendar, 
  BookOpen, 
  Package, 
  Shield 
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ProfileOverView from "../__components/ProfileOverView";
import Menu from "../__components/Menu";

// Actions
import { getLoggedInUser, getUserByUsername, verifiedUserData } from "@/lib/action/user";
import { getUserBook, getUserPurchasedBookIds } from "@/lib/action/book";
import { getSavedBooks } from "@/lib/action/save";
import { getAverageRating, getUserReviews } from "@/lib/action/review";
import SellerRatings from "../__components/SellerRating";

const Profile = async ({
  params
}: {
  params: Promise<{ id: string }>;
}) => {
  // 1. Resolve Params & User Context
  const { id: username } = await params;
  const req = await getLoggedInUser();
  const isOwnProfile = req.user?.username === username;

  // 2. Fetch Profile Data
  const { user: profile } = await getUserByUsername(username);

  // Handle case where user doesn't exist (optional: return notFound())
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">User not found</p>
      </div>
    );
  }

  // 3. Parallel Data Fetching
  // We use Promise.all for better performance since these requests are independent
  const [
    verifiedProfile,
    userListedBooks,
    savedBooks,
    purchasedBooks,
    ratingStats,
    userReviews
  ] = await Promise.all([
    verifiedUserData(profile.clerkId || "", profile.verification_status === "verified"),
    getUserBook(profile.id) || [],
    getSavedBooks(),
    getUserPurchasedBookIds(profile.id),
    getAverageRating(profile.id),
    getUserReviews(profile.id)
  ]);

  // 4. Data Transformation
  const isVerified = profile.verification_status === "verified";
  const displayName = profile.name || "User";
  const displayEmail = profile.email || "";
  const joinDate = profile.createdAt ? new Date(profile.createdAt) : new Date();

  // Calculate Sales (Books listed by this user that are marked as sold)
  // Assuming your book schema has isSold or status === 'sold'
  const soldBooksCount = userListedBooks.filter((book: any) => book.isSold).length;

  // Map reviews to the format SellerRatings expects
  const formattedReviews = userReviews.data.map((r) => ({
    id: r.id,
    reviewerName: r.reviewer.name || "Anonymous",
    reviewerImage: r.reviewer.profilePic,
    rating: r.rating,
    comment: r.feedback,
    createdAt: r.createdAt,
    bookTitle: "Verified Purchase" // You can join books table later if needed
  }));

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <main className="container py-6 max-w-3xl mx-auto px-4">
        
        {/* Profile Header */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            
            {/* Avatar Section */}
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-border">
                {profile.profile_pic ? (
                  <Image
                    height={80}
                    width={80}
                    src={profile.profile_pic}
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-primary" />
                )}
              </div>
              {isVerified && (
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center ring-2 ring-card">
                  <Shield className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                
                {/* Name & Details */}
                <div>
                  <h1 className="text-xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                    {displayName}
                    {isVerified && (
                      <Badge variant="secondary" className="text-[10px] bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200">
                        Verified
                      </Badge>
                    )}
                  </h1>
                  <p className="text-muted-foreground text-sm mb-2">
                    {displayEmail}
                  </p>

                  <div className="flex flex-col flex-wrap justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                    {isVerified && (
                      <div className="flex items-center gap-1 justify-center sm:justify-start">
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>{verifiedProfile?.department} • {verifiedProfile?.semester} Semester</span>
                      </div>
                    )}
                    <span className="flex items-center gap-1 justify-center sm:justify-start">
                      <Calendar className="h-3.5 w-3.5" />
                      Joined {joinDate.toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                  </div>

                  {!isVerified && (
                    <Link href="/profile/verify" className="inline-block mt-3">
                      <Badge variant="outline" className="cursor-pointer hover:bg-muted py-1">
                        <Shield className="h-3 w-3 mr-1" />
                        {profile.verification_status === "unverified"
                          ? "Verification Pending"
                          : "Verify your account"}
                      </Badge>
                    </Link>
                  )}
                </div>

                {/* Stats Block (Ratings & Sales) */}
                <div className="flex gap-6 items-center justify-center">
                  
                  {/* Reviews Trigger */}
                  <SellerRatings 
                    averageRating={ratingStats.data.average}
                    totalReviews={ratingStats.data.count}
                    reviews={formattedReviews}
                  />

                  <div className="w-px h-8 bg-border" />

                  {/* Sales Count */}
                  <div className="px-3 text-center">
                    <div className="text-lg font-bold text-foreground leading-none">
                      {soldBooksCount}
                    </div>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mt-1">
                      Sales
                    </p>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions (Only for Own Profile) */}
        {isOwnProfile && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Link href="/sell" className="w-full">
              <Button variant="default" className="w-full gap-2 h-12 shadow-sm">
                <Package className="h-5 w-5" />
                Sell a Book
              </Button>
            </Link>
            <Link href="/browse" className="w-full">
              <Button variant="outline" className="w-full gap-2 h-12">
                <BookOpen className="h-5 w-5" />
                Browse Books
              </Button>
            </Link>
          </div>
        )}

        {/* Overview Tab Content */}
        <ProfileOverView 
          userListedBook={userListedBooks} 
          purchasedBooks={purchasedBooks}  
          savedBooks={savedBooks} 
          isOwnProfile={isOwnProfile}
        />
        
        <Menu />
      </main>
    </div>
  );
};

export default Profile;