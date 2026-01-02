"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; // Import useRouter
import { CheckCircle, XCircle, Phone, BadgeCheck, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { VerificationRequest } from "@/db/schema";
import { useToast } from "@/hooks/use-toast";
import { DocumentPreview, getStatusBadge, InfoGrid } from "./helperComponents";
import DocumentCard from "./DocumentCard";

// IMPORT YOUR SERVER ACTION HERE
import { updateVerificationRequestStatus } from "@/lib/action/admin"; // <--- Adjust this path

interface DocumentModalWithCardProps {
  doc: VerificationRequest;
  onUpdateStatus?: (
    reqId: string,
    currentName: string,
    status: "verified" | "rejected",
    notes: string
  ) => Promise<void>;
}

export default function DocumentModalWithCard({
  doc,
  onUpdateStatus,
}: DocumentModalWithCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState(doc.admin_feedback || "");
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const { toast } = useToast();
  const router = useRouter(); // Initialize router

  const handleAction = async (status: "verified" | "rejected") => {
    // 1. Validation for rejection
    if (status === "rejected" && !adminNotes.trim()) {
      toast({
        title: "Feedback Required",
        description: "Please provide a reason for rejection in the notes field.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 2. Call the Server Action
      const success = await updateVerificationRequestStatus(
        doc.id, 
        status, 
        adminNotes
      );

      if (success) {
        toast({
          title: status === "verified" ? "Request Verified" : "Request Rejected",
          description: `Successfully updated status for ${doc.name}.`,
          variant: status === "verified" ? "default" : "destructive", // Green for success, Red for reject usually, but Shadcn default is black/white.
        });

        // 3. Optional: Call parent callback if provided (for optimistic UI updates)
        if (onUpdateStatus) {
           await onUpdateStatus(doc.id, doc.name, status, adminNotes);
        }

        // 4. Refresh the router to reflect Server Action revalidation
        router.refresh();
        
        // 5. Close modal
        setIsOpen(false);
      } else {
        throw new Error("Action returned false");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to update verification status. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <DocumentCard doc={doc} setImageLoading={setImageLoading} />
      </DialogTrigger>

      {/* --- MODAL CONTENT --- */}
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 rounded-lg bg-blue-100">
              <BadgeCheck className="w-6 h-6 text-blue-600" />
            </div>
            Review Verification Request
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Profile Details Header */}
          <div className="relative overflow-hidden rounded-2xl border border-gray-200">
            <div
              className={cn(
                "absolute inset-0 opacity-10",
                doc.verificationStatus === "pending"
                  ? "bg-linear-to-br from-amber-400 to-amber-600"
                  : doc.verificationStatus === "verified"
                  ? "bg-linear-to-br from-emerald-400 to-emerald-600"
                  : "bg-linear-to-br from-rose-400 to-rose-600"
              )}
            />
            <div className="relative p-6 flex items-start gap-5">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={doc.profile_pic}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-mono mt-1">
                      {doc.clerkId}
                    </p>
                  </div>
                  {getStatusBadge(doc.verificationStatus || "")}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />{" "}
                  <span className="font-medium">{doc.phoneNo}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Grid */}
          <InfoGrid doc={doc} />

          <Separator />

          {/* Document Preview */}
          <DocumentPreview
            url={doc.document_pic}
            loading={imageLoading}
            onLoad={() => setImageLoading(false)}
          />

          <Separator />

          {/* Admin Notes Section */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">
              Admin Notes
            </h4>
            <Textarea
              placeholder="Reason for rejection (required if rejecting)..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="min-h-30 resize-none"
              // Disable editing if not pending
              disabled={doc.verificationStatus !== "pending" || isProcessing}
            />
            {/* Show notes if they exist and status is closed */}
            {doc.admin_feedback && doc.verificationStatus !== "pending" && (
              <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 border">
                 <span className="font-semibold block mb-1">Previous Feedback:</span>
                 {doc.admin_feedback}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {doc.verificationStatus === "pending" ? (
            <div className="flex gap-4 pt-2">
              <Button
                variant="destructive"
                className="flex-1 h-12 text-base font-semibold shadow-md"
                disabled={isProcessing}
                onClick={() => handleAction("rejected")}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <XCircle className="w-5 h-5 mr-2" />
                )}
                Reject Request
              </Button>
              <Button
                className="flex-1 h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-md"
                disabled={isProcessing}
                onClick={() => handleAction("verified")}
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5 mr-2" />
                )}
                Approve & Verify
              </Button>
            </div>
          ) : (
            <div className="p-6 bg-gray-50 rounded-xl text-center border border-gray-200 text-gray-600">
              This request has already been{" "}
              <span className={cn(
                "font-bold uppercase",
                doc.verificationStatus === "verified" ? "text-emerald-600" : "text-rose-600"
              )}>
                {doc.verificationStatus}
              </span>
              .
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}