"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FileCheck, CheckCircle, XCircle, Clock, User, Mail, AlertCircle } from "lucide-react";
import { VerificationDocument } from "@/constants";

export default function VerificationsClient({ initialDocs }: { initialDocs: VerificationDocument[] }) {
  const [documents, setDocuments] = useState<VerificationDocument[]>(initialDocs);
  const [selectedDoc, setSelectedDoc] = useState<VerificationDocument | null>(null);
  const { toast } = useToast();

  const updateStatus = (docId: string, status: "approved" | "rejected") => {
    setDocuments(documents.map(d => d.id === docId ? { ...d, status } : d));
    setSelectedDoc(null);
    toast({ title: `Request ${status} (Mock)` });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-emerald-500/10 text-emerald-600"><CheckCircle className="w-3 h-3 mr-1" />Verified</Badge>;
      case "rejected": return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default: return <Badge className="bg-amber-500/10 text-amber-600"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <AlertCircle className="w-5 h-5 text-amber-500" />
        <h2 className="text-lg font-semibold">Verification Requests</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {documents.map((doc) => (
          <Card 
            key={doc.id} 
            className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setSelectedDoc(doc)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold">{doc.profile?.full_name || "Unknown"}</h3>
                    <p className="text-sm text-muted-foreground">{doc.profile?.email}</p>
                    <div className="mt-2">{getStatusBadge(doc.status)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedDoc} onOpenChange={() => setSelectedDoc(null)}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Verification Review</DialogTitle>
            </DialogHeader>
            {selectedDoc && (
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4"/> {selectedDoc.profile?.email}
                    </div>
                    <div className="p-4 bg-muted rounded-md text-center">
                        <p className="text-sm">Document: {selectedDoc.document_type}</p>
                        <p className="text-xs text-muted-foreground break-all">{selectedDoc.document_url}</p>
                    </div>
                    {selectedDoc.status === 'pending' && (
                        <div className="flex gap-2">
                             <Button className="flex-1" variant="destructive" onClick={() => updateStatus(selectedDoc.id, "rejected")}>Reject</Button>
                             <Button className="flex-1" onClick={() => updateStatus(selectedDoc.id, "approved")}>Approve</Button>
                        </div>
                    )}
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}