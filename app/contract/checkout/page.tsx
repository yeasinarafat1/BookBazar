import { getContractById } from "@/lib/action/contract";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getLoggedInUser } from "@/lib/action/user";

import { 
  ShieldCheck, 
  MapPin, 
  User, 
  MessageCircle, 
  Phone,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Receipt,
  Sparkles
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import PurchaseButton from "./components/PurchaseButton";
import CancelContractButton from "./components/CancelContractButton";

interface CheckoutPageProps {
  searchParams: Promise<{ contractId: string }>;
}

export default async function CheckoutPage({ 
  searchParams 
}: CheckoutPageProps) {
  const { contractId } = await searchParams;
  const { user } = await getLoggedInUser();
  const userId = user?.id;

  if (!contractId) return notFound();
  
  const contract = await getContractById(contractId);
  
  if (!contract) return notFound();

  // Safely access seller info with fallbacks
  const sellerName = contract.seller?.name || "Unknown Seller";
  const sellerPic = contract.seller?.profilePic;
  const sellerVerified = contract.seller?.verificationStatus === 'verified';

  const isOwner = userId === contract.sellerId;
  const isBuyer = userId === contract.buyerId;
  const isSold = contract.status === "completed";
  const isCancelled = contract.status === "cancelled";

  const originalTotal = contract.books.reduce((acc, book) => acc + book.price, 0);
  const savings = originalTotal - contract.price;

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <div className="container max-w-5xl mx-auto px-4">
        
        {/* Minimal Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm text-emerald-600">
             <Receipt className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
            <p className="text-sm text-gray-500">Contract ID: <span className="font-mono text-xs text-gray-400">#{contract.id.slice(0,8)}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT COLUMN: Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Status Banners (Clean) */}
            {isSold && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center gap-3 text-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Order Complete</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    {isBuyer ? "You have reserved this bundle." : "This transaction is closed."}
                  </p>
                </div>
              </div>
            )}

            {isCancelled && (
              <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3 text-red-900">
                <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Contract Cancelled</p>
                  <p className="text-xs text-red-700 mt-0.5">This checkout link is invalid.</p>
                </div>
              </div>
            )}

            {/* Books List (Card Style) */}
            <Card className="overflow-hidden border border-gray-200 shadow-sm bg-white rounded-xl">
              <div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-semibold text-gray-900">Included Books ({contract.books.length})</h2>
                {savings > 0 && (
                  <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-normal">
                    <Sparkles className="h-3 w-3 mr-1" /> Bundle Deal
                  </Badge>
                )}
              </div>
              
              <div className="divide-y divide-gray-50">
                {contract.books.map((book) => (
                  <div key={book.id} className="p-4 flex gap-4 hover:bg-gray-50/50 transition-colors">
                    {/* Book Image */}
                    <div className="relative h-20 w-16 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden border border-gray-100">
                      {book.images?.[0] ? (
                        <Image src={book.images[0]} alt={book.title} fill className="object-cover" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-300 text-[10px]">NO IMG</div>
                      )}
                    </div>
                    
                    {/* Book Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{book.title}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">{book.author}</p>
                      <div className="flex gap-2 mt-2">
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200 capitalize">
                          {book.condition}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full border border-gray-200 capitalize">
                          {book.category}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right flex flex-col justify-center">
                       <span className="text-sm text-gray-400 line-through">৳{book.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Seller Info (Clean Row) */}
            <Card className="p-5 border border-gray-200 shadow-sm bg-white rounded-xl flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-gray-100 relative overflow-hidden border border-gray-100">
                {sellerPic ? (
                  <Image src={sellerPic} alt={sellerName} fill className="object-cover" />
                ) : (
                  <User className="h-full w-full p-3 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-gray-900">{sellerName}</h4>
                  {sellerVerified && (
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500">Verified Seller</p>
              </div>
              
              {(isBuyer || isOwner) && (
                <div className="flex gap-2">
                   <Button variant="outline" size="sm" className="h-9 px-3 text-gray-600 border-gray-200 hover:bg-gray-50">
                     <Phone className="h-4 w-4 mr-2" /> Call
                   </Button>
                   <Button variant="outline" size="sm" className="h-9 px-3 text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100">
                     <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                   </Button>
                </div>
              )}
            </Card>
          </div>

          {/* RIGHT COLUMN: Payment Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              
              <Card className="p-6 border border-gray-200 shadow-sm bg-white rounded-xl">
                <h2 className="font-semibold text-gray-900 mb-5">Payment Summary</h2>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>৳{originalTotal}</span>
                  </div>
                  
                  {savings > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount</span>
                      <span>- ৳{savings}</span>
                    </div>
                  )}

                  <Separator className="my-3" />

                  <div className="flex justify-between items-end">
                    <span className="font-semibold text-gray-900">Total</span>
                    <span className="font-bold text-2xl text-gray-900">৳{contract.price}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  
                  {isCancelled ? (
                     <Button disabled className="w-full h-12 bg-red-50 text-red-400 border border-red-100">
                       Contract Cancelled
                     </Button>
                  ) : !isSold && !isOwner && (
                    <>
                      <PurchaseButton 
                        contractId={contract.id} 
                        price={contract.price} 
                        isOwner={isOwner}
                        isSold={isSold}
                      />
                      <div className="flex items-start gap-2 text-[11px] text-gray-400 text-center justify-center pt-2">
                        <ShieldCheck className="h-3 w-3 mt-0.5" />
                        <p>Secure Handshake Protocol</p>
                      </div>
                    </>
                  )}
                  
                  {isOwner && !isSold && (
                    <div className="space-y-3">
                      <div className="bg-amber-50 text-amber-700 p-3 rounded-lg text-center text-xs font-medium border border-amber-100">
                        This is your listing
                      </div>
                      <CancelContractButton contractId={contract.id} />
                    </div>
                  )}

                  {isSold && (
                    <Button disabled className="w-full h-12 bg-gray-100 text-gray-400 border border-gray-200">
                      Sold
                    </Button>
                  )}
                </div>
              </Card>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                <MapPin className="h-3 w-3" />
                <span>Meet on campus • Cash on Delivery</span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}