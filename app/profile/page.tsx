import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Star, Calendar, BookOpen, Package, Shield } from "lucide-react";


import ProfileOverView from "./__components/ProfileOverView";
import Menu from "./__components/Menu";
import { getLoggedInUser, verifiedUserData } from "@/lib/action/user";
import { getUserBook } from "@/lib/action/book";
import Image from "next/image";



const Profile = async () => {
  const req = await getLoggedInUser();
  const profile = req?.user;
  const verifiedProfile = await verifiedUserData(profile?.clerkId || "", profile?.verification_status === "verified");


  const userListedBooks = await getUserBook(profile?.id || "") || [];

  const isVerified =
    profile?.verification_status=== "verified";
  const displayName = profile?.name || "User";
  const displayEmail = profile?.email || "";
  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt)
    : new Date();

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <main className="container py-6 max-w-3xl mx-auto px-4">
        {/* Profile Header */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                {profile?.profile_pic ? (
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
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Shield className="h-3 w-3 text-primary-foreground" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-xl font-bold text-foreground flex items-center justify-center sm:justify-start gap-2">
                {displayName}
                {isVerified && (
                  <Badge variant="default" className="text-[10px]">
                    Verified
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground text-sm mb-2">
                {displayEmail}
              </p>

              <div className="flex flex-col flex-wrap justify-center sm:justify-start gap-3 text-sm text-muted-foreground">
                {isVerified && (
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {verifiedProfile?.department} {verifiedProfile?.semester} Semester
                  </div>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Joined{" "}
                  {joinDate.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>

              {!isVerified && (
                <Link href="/profile/verify">
                  <Badge
                    variant="outline"
                    className="mt-2 cursor-pointer hover:bg-muted"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {profile?.verification_status === "unverified"
                      ? "Verification Pending"
                      : "Verify your account"}
                  </Badge>
                </Link>
              )}
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-center">
              <div>
                <div className="flex items-center justify-center gap-1">
                  <Star className="h-4 w-4 fill-warning text-warning" />
                  <span className="text-lg font-bold text-foreground">4.8</span>
                </div>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div>
                <div className="text-lg font-bold text-foreground">12</div>
                <p className="text-xs text-muted-foreground">Sales</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Link href="/sell" className="w-full">
            <Button variant="default" className="w-full gap-2 h-12">
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

        <ProfileOverView userListedBook={userListedBooks}/>
        <Menu />
      </main>
    </div>
  );
};

export default Profile;
