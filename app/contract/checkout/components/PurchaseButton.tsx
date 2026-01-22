"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { acceptContract } from "@/lib/action/contract";
import { useRouter } from "next/navigation";
import confetti from "canvas-confetti";

interface PurchaseButtonProps {
  contractId: string;
  price: number;
  isOwner: boolean;
  isSold: boolean;
}

export default function PurchaseButton({ contractId, price, isOwner, isSold }: PurchaseButtonProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const triggerCelebration = () => {
    const end = Date.now() + 3 * 1000;
    const colors = ["#10B981", "#34D399", "#059669"];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
  };

  const handlePurchase = async () => {
    setLoading(true);
    try {
      const result = await acceptContract(contractId);
      
      if (result.success) {
        triggerCelebration(); // 🎉 The "Convey" Effect
        
        toast({
          title: "Order Secured",
          description: "You have successfully purchased this bundle.",
          className: "bg-emerald-600 text-white border-none"
        });
        router.refresh();
      } else {
        toast({
          title: "Purchase Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (isSold) {
    return (
      <Button disabled className="w-full h-12 bg-gray-100 text-gray-400 border border-gray-200 shadow-none font-medium">
        Sold Out
      </Button>
    );
  }

  if (isOwner) {
    return (
      <Button disabled className="w-full h-12 bg-gray-50 text-gray-400 border border-gray-200 shadow-none font-medium">
        Waiting for Buyer
      </Button>
    );
  }

  return (
    <Button 
      onClick={handlePurchase}
      disabled={loading}
      className="w-full h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-100 transition-all hover:translate-y-[-1px] active:translate-y-[0px]"
    >
      {loading ? (
        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
      ) : (
        <>
          <ShieldCheck className="mr-2 h-5 w-5" />
          Confirm Order • ৳{price}
        </>
      )}
    </Button>
  );
}