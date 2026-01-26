"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { ReviewDialog } from "./ReviewDialouge"; // Ensure this matches your file structure
import { toast } from "sonner";
import { addReview } from "@/lib/action/review";

interface ReviewButtonProps {
  SellerName: string;
    contractId: string;
    
  // You can add more props here if needed for the API call (e.g. contractId)
}

export default function ReviewButton({ SellerName,contractId }: ReviewButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

const handleReviewSubmit = async (data: { rating: number; comment: string }) => {
    try {
      // 1. Call the Server Action
      const result = await addReview(contractId, data.rating, data.comment);

      // 2. Handle Response
      if (result.success) {
        toast.success(result.message); // "Review submitted successfully!"
        setIsOpen(false); // Close the dialog
      } else {
        toast.error(result.message); // e.g., "You have already reviewed this order."
      }
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  return (
    <>
      <Button 
        onClick={() => setIsOpen(true)}
        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 transition-all active:scale-[0.98] font-semibold text-base"
      >
        {/* Subtle fill on the star makes it look more actionable */}
        <Star className="mr-2 h-5 w-5 fill-white/20" /> 
        Rate & Review
      </Button>

      <ReviewDialog 
        open={isOpen} 
        onOpenChange={setIsOpen}
        SellerName={SellerName}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}