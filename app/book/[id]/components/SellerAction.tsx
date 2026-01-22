"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { 
  Edit, Trash2, Handshake, Copy, QrCode, Check, 
  Loader2, Clock, ShoppingBag, CheckCircle2 
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";
import Image from "next/image";
import { getSellerUnsoldBooks } from "@/lib/action/book";
import { createContract } from "@/lib/action/contract"; // Import the real server action
import { cn } from "@/lib/utils";

interface SellerActionsProps {
  bookId: string;
  sellerId: string;
  currentPrice: number;
}

interface InventoryBook {
  id: string;
  title: string;
  price: number;
  image: string;
}

export default function SellerActions({ bookId, sellerId, currentPrice }: SellerActionsProps) {
  const [open, setOpen] = useState(false);
  
  // Contract Logic State
  const [step, setStep] = useState<"select" | "confirm" | "ready">("select");
  const [inventory, setInventory] = useState<InventoryBook[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([bookId]);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [customPrice, setCustomPrice] = useState("");
  
  // Generation State
  const [contractUrl, setContractUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. Fetch Inventory when Dialog Opens
  useEffect(() => {
    if (open && inventory.length === 0) {
      setLoadingInventory(true);
      getSellerUnsoldBooks(sellerId)
        .then((data) => {
          setInventory(data);
          // Ensure current book is selected by default
          if (!selectedIds.includes(bookId)) {
            setSelectedIds((prev) => [...prev, bookId]);
          }
        })
        .finally(() => setLoadingInventory(false));
    }
  }, [open, sellerId, inventory.length, bookId, selectedIds]);

  // 2. Calculate Total Price of Selected Items
  const calculatedTotal = useMemo(() => {
    return inventory
      .filter((b) => selectedIds.includes(b.id))
      .reduce((sum, b) => sum + b.price, 0);
  }, [inventory, selectedIds]);

  // 3. Sync Custom Price when entering Confirm step
  useEffect(() => {
    if (step === "confirm") {
      setCustomPrice(calculatedTotal.toString());
    }
  }, [step, calculatedTotal]);

  // Toggle Selection
  const toggleBook = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 4. Generate Contract (Call Server Action)
  const handleGenerate = async () => {
    console.log("Generating contract for:", { sellerId, selectedIds, customPrice });
    const finalPrice = parseFloat(customPrice);
    if (isNaN(finalPrice) || finalPrice < 0) {
      toast({ title: "Invalid Price", description: "Price cannot be negative", variant: "destructive" });
      return;
    }

    setIsGenerating(true);

    try {
      // Call the Server Action
      const result = await createContract(sellerId, selectedIds, finalPrice);

      if (result.success && result.contractId) {
        // Construct the checkout URL
        const url = `${window.location.origin}/contract/checkout?contractId=${result.contractId}`;
        setContractUrl(url);
        setStep("ready");
        toast({ title: "Contract Ready!", description: "Share the link with the buyer." });
      } else {
        toast({ 
          title: "Error", 
          description: result.message || "Failed to create contract", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ title: "System Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(contractUrl);
    setCopied(true);
    toast({ title: "Copied to clipboard" });
    setTimeout(() => setCopied(false), 2000);
  };

  const resetFlow = () => {
    setOpen(false);
    setTimeout(() => {
      setStep("select");
      setContractUrl("");
      setSelectedIds([bookId]);
    }, 300);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
      {/* Header Info */}
      <div className="flex items-center gap-3 mb-2">
        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
          <Handshake className="h-5 w-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">Manage Listing</h3>
          <p className="text-sm text-gray-500">You are the seller</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full gap-2">
          <Edit className="h-4 w-4" /> Edit
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="w-full gap-2 bg-red-50 text-red-600 hover:bg-red-100 border-red-200 shadow-none">
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently remove this book from the marketplace.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction className="bg-red-600">Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {/* --- CREATE CONTRACT DIALOG --- */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:scale-[1.02]">
            <Handshake className="h-4 w-4" />
            Create Sale Contract
          </Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              {step === "ready" ? <QrCode className="h-6 w-6 text-emerald-600" /> : <ShoppingBag className="h-6 w-6 text-emerald-600" />}
              {step === "select" && "Select Books to Sell"}
              {step === "confirm" && "Confirm Contract Details"}
              {step === "ready" && "Contract Ready"}
            </DialogTitle>
            <DialogDescription>
              {step === "select" && "Select the books you want to include in this single contract."}
              {step === "confirm" && "Review the total price. You can offer a discount if you wish."}
              {step === "ready" && "Share this code with the buyer to complete the deal."}
            </DialogDescription>
          </DialogHeader>

          {/* --- STEP 1: SELECT BOOKS (New Grid Layout) --- */}
          {step === "select" && (
            <div className="py-2">
              {loadingInventory ? (
                <div className="py-12 flex justify-center text-muted-foreground">
                   <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <ScrollArea className="h-[320px] pr-4 -mr-4">
                    <div className="grid grid-cols-1 gap-3 pb-2">
                      {inventory.map((item) => {
                        const isSelected = selectedIds.includes(item.id);
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => toggleBook(item.id)}
                            className={cn(
                              "relative flex items-center gap-4 p-3 rounded-xl border-2 transition-all cursor-pointer group select-none",
                              isSelected 
                                ? "border-emerald-500 bg-emerald-50/50" 
                                : "border-gray-100 hover:border-emerald-200 hover:bg-gray-50"
                            )}
                          >
                            {/* Custom Checkbox */}
                            <div className={cn(
                              "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0",
                              isSelected ? "border-emerald-500 bg-emerald-500" : "border-gray-300 bg-white"
                            )}>
                              {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                            </div>

                            {/* Book Image */}
                            <div className="h-14 w-12 relative rounded-md overflow-hidden bg-gray-200 flex-shrink-0 border border-gray-100">
                               <Image src={item.image} alt={item.title} fill className="object-cover" />
                            </div>

                            {/* Book Details */}
                            <div className="flex-1 min-w-0">
                              <h4 className={cn(
                                "text-sm font-semibold truncate transition-colors",
                                isSelected ? "text-emerald-900" : "text-gray-900"
                              )}>
                                {item.title}
                              </h4>
                              <p className="text-sm font-medium text-emerald-600">
                                ৳{item.price}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                  
                  {/* Summary Footer */}
                  <div className="mt-4 pt-4 border-t flex justify-between items-center bg-gray-50/50 -mx-6 px-6 -mb-6 pb-6 rounded-b-lg">
                     <div>
                       <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Selected</span>
                       <p className="text-sm font-semibold text-gray-900">{selectedIds.length} books</p>
                     </div>
                     <div className="text-right">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">Total Value</span>
                        <span className="text-2xl font-bold text-emerald-600">৳{calculatedTotal}</span>
                     </div>
                  </div>
                  
                  <Button 
                    className="w-full mt-6 bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg" 
                    disabled={selectedIds.length === 0}
                    onClick={() => setStep("confirm")}
                  >
                    Proceed to Pricing
                  </Button>
                </>
              )}
            </div>
          )}

          {/* --- STEP 2: CONFIRM PRICE --- */}
          {step === "confirm" && (
             <div className="space-y-6 py-4">
               {/* Pricing Card */}
               <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Inventory Value ({selectedIds.length} items)</span>
                    <span className="font-medium line-through text-gray-400">৳{calculatedTotal}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-emerald-100">
                    <Label htmlFor="custom-price" className="text-base font-semibold text-emerald-950">Final Deal Price</Label>
                    <div className="relative w-40">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600 font-bold text-lg">৳</span>
                      <Input 
                        id="custom-price"
                        value={customPrice}
                        onChange={(e) => setCustomPrice(e.target.value)}
                        className="pl-8 h-12 text-xl font-bold text-right border-emerald-200 focus-visible:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>
               </div>

               <div className="flex items-start gap-3 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                 <Clock className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                 <p>This contract link will remain valid for <strong>24 hours</strong>. The buyer must complete the payment within this time.</p>
               </div>

               <div className="flex gap-3 pt-2">
                 <Button variant="outline" onClick={() => setStep("select")} className="h-12 px-6">Back</Button>
                 <Button 
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg shadow-lg shadow-emerald-200" 
                    onClick={handleGenerate} 
                    disabled={isGenerating}
                 >
                    {isGenerating ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Handshake className="h-5 w-5 mr-2" />}
                    Generate Contract
                 </Button>
               </div>
             </div>
          )}

          {/* --- STEP 3: QR & READY --- */}
          {step === "ready" && (
             <div className="py-4 space-y-6">
                <div className="flex flex-col items-center gap-6">
                   <div className="relative">
                     <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-2xl blur opacity-30"></div>
                     <div className="relative p-6 bg-white border border-gray-100 rounded-2xl shadow-xl">
                        <QRCodeSVG value={contractUrl} size={180} level="H" />
                     </div>
                     <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> ৳{customPrice}
                     </div>
                   </div>
                   
                   <p className="text-center text-gray-600 max-w-[80%]">
                     Show this code to the buyer, or share the link below.
                   </p>
                </div>

                <div className="space-y-2">
                   <Label className="text-xs uppercase text-gray-400 font-bold tracking-wider">Contract Link</Label>
                   <div className="flex gap-2">
                      <Input readOnly value={contractUrl} className="bg-gray-50 font-mono text-xs text-gray-600 h-10" />
                      <Button size="icon" className={cn("h-10 w-10 shrink-0", copied ? "bg-green-600" : "bg-gray-900")} onClick={handleCopy}>
                          {copied ? <Check className="h-5 w-5 text-white" /> : <Copy className="h-5 w-5" />}
                      </Button>
                   </div>
                </div>

                <Button variant="outline" className="w-full h-11 border-gray-200 hover:bg-gray-50 hover:text-gray-900" onClick={resetFlow}>
                   Close & Create New
                </Button>
             </div>
          )}

        </DialogContent>
      </Dialog>
    </div>
  );
}