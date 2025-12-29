"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  ExternalLink, 
  Phone, 
  Building2, 
  GraduationCap,
  CalendarDays,
  BadgeCheck,
  FileText,
  ImageIcon,
  AlertCircle,
  User,
  Hash,
  Sun,
  Loader2,
  FileCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { VerificationRequest } from "@/db/schema";
import { updateVerificationRequestStatus } from "@/lib/action/admin"; 

export default function VerificationsClient({ requests = [] }: { requests: VerificationRequest[] | null }) {
  const [localRequests, setLocalRequests] = useState<VerificationRequest[]>(requests || []);
  
  // OPTIMIZATION: Store ID only, derive object. This ensures the Dialog always shows the latest data.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const [adminNotes, setAdminNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const { toast } = useToast();

  // Derived state for the selected document
  const selectedDoc = useMemo(() => 
    localRequests.find(req => req.id === selectedId) || null, 
  [localRequests, selectedId]);

  // BETTER HANDLE UPDATE: Accepts data directly, no mapping of entire array
  const handleUpdateStatus = async (reqId: string, currentName: string, status: "verified" | "rejected", notes: string) => {
    
    // Validation
    if (status === "rejected" && !notes.trim()) {
      toast({ 
        title: "Feedback Required", 
        description: "Please provide a reason for rejection.", 
        variant: "destructive" 
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Server Action
      const success = await updateVerificationRequestStatus(reqId, status, notes);
      if (!success) throw new Error("Update failed");

      // 2. Optimistic Update without .map()
      setLocalRequests(prev => {
        // Find index (stops iterating once found)
        const index = prev.findIndex(r => r.id === reqId);
        if (index === -1) return prev;

        // Create shallow copy of array
        const newArr = [...prev];
        
        // Update only the specific index
        newArr[index] = { 
          ...newArr[index], 
          verificationStatus: status, 
          admin_feedback: notes 
        };
        
        return newArr;
      });

      toast({ 
        title: status === 'verified' ? "✓ Request Verified" : "✗ Request Rejected",
        description: `Successfully updated status for ${currentName}`
      });
      
      // Cleanup
      setSelectedId(null);
      setAdminNotes("");

    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to update status", variant: "destructive" });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"><CheckCircle className="w-3.5 h-3.5 mr-1.5" />Verified</Badge>;
      case "rejected":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"><XCircle className="w-3.5 h-3.5 mr-1.5" />Rejected</Badge>;
      default:
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"><Clock className="w-3.5 h-3.5 mr-1.5" />Pending Review</Badge>;
    }
  };

  const pendingDocs = localRequests.filter(d => d.verificationStatus === "pending");
  const approvedDocs = localRequests.filter(d => d.verificationStatus === "verified");
  const rejectedDocs = localRequests.filter(d => d.verificationStatus === "rejected");

  const DocumentCard = ({ doc }: { doc: VerificationRequest }) => (
    <Card 
      className={cn(
        "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border overflow-hidden",
        doc.verificationStatus === "pending" ? "border-amber-200 bg-gradient-to-br from-amber-50/50 to-white" :
        doc.verificationStatus === "verified" ? "border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white" :
        "border-rose-200 bg-gradient-to-br from-rose-50/50 to-white"
      )}
      onClick={() => {
          setSelectedId(doc.id);
          setAdminNotes(doc.admin_feedback || "");
          setImageLoading(true);
      }}
    >
      <CardContent className="p-0">
        <div className={cn(
          "h-2",
          doc.verificationStatus === "pending" ? "bg-gradient-to-r from-amber-400 to-amber-500" :
          doc.verificationStatus === "verified" ? "bg-gradient-to-r from-emerald-400 to-emerald-500" :
          "bg-gradient-to-r from-rose-400 to-rose-500"
        )} />
        
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg ring-2 ring-gray-100">
                <img src={doc.profile_pic} alt={doc.name} className="w-full h-full object-cover" />
              </div>
              {doc.verificationStatus === "pending" && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full animate-pulse shadow-lg border-2 border-white">
                  <div className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-75" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate text-lg">{doc.name}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <Phone className="w-3.5 h-3.5" /> {doc.phoneNo}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant="outline" className="text-xs font-medium border-gray-200 bg-white/80">
                  <Building2 className="w-3 h-3 mr-1" />{doc.department}
                </Badge>
                <Badge variant="outline" className="text-xs font-medium border-gray-200 bg-white/80">
                  <Sun className="w-3 h-3 mr-1" />{doc.shift}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-400 flex items-center">
                  <CalendarDays className="w-3 h-3 mr-1" />
                  {format(new Date(doc.createdAt), "MMM d, yyyy")}
                </p>
                {getStatusBadge(doc.verificationStatus || "")}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard label="Pending Review" count={pendingDocs.length} icon={Clock} color="amber" />
        <StatsCard label="Verified" count={approvedDocs.length} icon={CheckCircle} color="emerald" />
        <StatsCard label="Rejected" count={rejectedDocs.length} icon={XCircle} color="rose" />
      </div>

      {/* Pending Section */}
      {pendingDocs.length > 0 && (
        <div className="space-y-4">
          <SectionHeader icon={AlertCircle} title="Pending Verification Requests" color="text-amber-600" bg="bg-amber-100" />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pendingDocs.map((doc) => <DocumentCard key={doc.id} doc={doc} />)}
          </div>
        </div>
      )}

      {/* All Requests */}
      <div className="space-y-4">
        <SectionHeader icon={FileCheck} title="All Verification Requests" color="text-gray-600" bg="bg-gray-100" />
        {localRequests.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {localRequests.map((doc) => <DocumentCard key={doc.id} doc={doc} />)}
          </div>
        )}
      </div>

      {/* Review Dialog */}
      <Dialog open={!!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-blue-100">
                <BadgeCheck className="w-6 h-6 text-blue-600" />
              </div>
              Review Verification Request
            </DialogTitle>
          </DialogHeader>

          {selectedDoc && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="relative overflow-hidden rounded-2xl border border-gray-200">
                 {/* ... (Gradient Background Logic same as before) ... */}
                 <div className={cn(
                  "absolute inset-0 opacity-10",
                  selectedDoc.verificationStatus === "pending" ? "bg-gradient-to-br from-amber-400 to-amber-600" :
                  selectedDoc.verificationStatus === "verified" ? "bg-gradient-to-br from-emerald-400 to-emerald-600" :
                  "bg-gradient-to-br from-rose-400 to-rose-600"
                )} />
                <div className="relative p-6 flex items-start gap-5">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg">
                    <img src={selectedDoc.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">{selectedDoc.name}</h3>
                        <p className="text-sm text-gray-500 font-mono mt-1">{selectedDoc.clerkId}</p>
                      </div>
                      {getStatusBadge(selectedDoc.verificationStatus || "")}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" /> <span className="font-medium">{selectedDoc.phoneNo}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <InfoGrid doc={selectedDoc} />

              <Separator />

              {/* Document View */}
              <DocumentPreview 
                url={selectedDoc.document_pic} 
                loading={imageLoading} 
                onLoad={() => setImageLoading(false)} 
              />

              <Separator />

              {/* Admin Notes */}
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Admin Notes</h4>
                <Textarea
                  placeholder="Reason for rejection (required)..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  className="min-h-[120px] resize-none"
                  disabled={selectedDoc.verificationStatus !== "pending"}
                />
                {selectedDoc.admin_feedback && selectedDoc.verificationStatus !== "pending" && (
                   <div className="mt-3 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">{selectedDoc.admin_feedback}</div>
                )}
              </div>

              {/* Actions: Passing data directly from here */}
              {selectedDoc.verificationStatus === "pending" ? (
                <div className="flex gap-4 pt-2">
                  <Button 
                    variant="destructive" 
                    className="flex-1 h-12 text-base font-semibold shadow-md"
                    disabled={isProcessing}
                    onClick={() => handleUpdateStatus(selectedDoc.id, selectedDoc.name, "rejected", adminNotes)}
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <XCircle className="w-5 h-5 mr-2" />}
                    Reject Request
                  </Button>
                  <Button 
                    className="flex-1 h-12 text-base font-semibold bg-emerald-600 hover:bg-emerald-700 shadow-md"
                    disabled={isProcessing}
                    onClick={() => handleUpdateStatus(selectedDoc.id, selectedDoc.name, "verified", adminNotes)}
                  >
                    {isProcessing ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle className="w-5 h-5 mr-2" />}
                    Approve & Verify
                  </Button>
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-xl text-center border border-gray-200 text-gray-600">
                  This request has already been <span className="font-bold">{selectedDoc.verificationStatus}</span>.
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-components to keep main file clean
const StatsCard = ({ label, count, icon: Icon, color }: any) => (
  <Card className={`border-0 shadow-lg bg-gradient-to-br from-${color}-500 to-${color}-600 text-white overflow-hidden relative`}>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
    <CardContent className="p-6 relative">
      <div className="flex items-center justify-between">
        <div><p className={`text-${color}-100 text-sm font-medium mb-1`}>{label}</p><p className="text-4xl font-bold">{count}</p></div>
        <div className="p-4 rounded-2xl bg-white/20 backdrop-blur-sm"><Icon className="w-8 h-8" /></div>
      </div>
    </CardContent>
  </Card>
);

const SectionHeader = ({ icon: Icon, title, color, bg }: any) => (
  <div className="flex items-center gap-3">
    <div className={`p-2 rounded-lg ${bg}`}><Icon className={`w-5 h-5 ${color}`} /></div>
    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
  </div>
);

const InfoGrid = ({ doc }: { doc: VerificationRequest }) => (
  <div>
    <h4 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider flex items-center gap-2"><User className="w-4 h-4"/> Student Information</h4>
    <div className="grid grid-cols-2 gap-4">
      <InfoItem icon={Hash} label="Roll Number" value={doc.rollNo} color="blue" />
      <InfoItem icon={Hash} label="Reg Number" value={doc.regNo} color="purple" />
      <InfoItem icon={Building2} label="Department" value={doc.department} color="emerald" />
      <InfoItem icon={GraduationCap} label="Semester" value={doc.semester} color="orange" />
      <div className="col-span-2"><InfoItem icon={Sun} label="Shift" value={doc.shift} color="amber" /></div>
    </div>
  </div>
);

const InfoItem = ({ icon: Icon, label, value, color }: any) => (
  <div className={`p-4 bg-gradient-to-br from-${color}-50 to-white rounded-xl border border-${color}-100`}>
    <div className="flex items-center gap-2 mb-2"><Icon className={`w-4 h-4 text-${color}-600`} /><p className={`text-xs font-semibold text-${color}-600 uppercase`}>{label}</p></div>
    <p className="font-bold text-gray-900">{value}</p>
  </div>
);

const DocumentPreview = ({ url, loading, onLoad }: any) => (
  <div>
    <div className="flex items-center justify-between mb-4">
      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2"><FileText className="w-4 h-4"/> Verification Document</h4>
      <Badge variant="outline" className="font-medium"><ImageIcon className="w-3 h-3 mr-1"/> Student ID Card</Badge>
    </div>
    {url ? (
      <div className="relative group rounded-2xl overflow-hidden border-2 border-gray-200 bg-gray-50">
        <div className="relative w-full min-h-[300px] flex items-center justify-center">
          {loading && <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>}
          <img src={url} alt="Document" className="max-w-full max-h-[400px] object-contain" onLoad={onLoad} />
        </div>
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
          <a href={url} target="_blank" rel="noopener noreferrer">
             <Button variant="secondary" size="lg"><ExternalLink className="w-5 h-5 mr-2"/> View Full Size</Button>
          </a>
        </div>
      </div>
    ) : (
      <div className="p-16 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
        <ImageIcon className="w-16 h-16 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">No document uploaded</p>
      </div>
    )}
  </div>
);

const EmptyState = () => (
  <Card className="border-2 border-dashed border-gray-200 shadow-none">
    <CardContent className="py-16 text-center">
      <div className="p-4 rounded-2xl bg-gray-100 w-fit mx-auto mb-4"><FileCheck className="w-12 h-12 text-gray-400" /></div>
      <p className="text-gray-600 font-medium mb-1">No verification requests yet</p>
    </CardContent>
  </Card>
);