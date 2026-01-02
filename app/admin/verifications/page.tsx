import { getAllVerificationRequests } from "@/lib/action/admin";

import StatsCard from "./__component/StatCard";
import { AlertCircle, CheckCircle, Clock, FileCheck, XCircle } from "lucide-react";
import { EmptyState, SectionHeader } from "./__component/helperComponents";
import DocumentModalWithCard from "./__component/DocumentModalWIthCard";

export default async function VerificationsPage() {
  const req = await getAllVerificationRequests();
   const pendingDocs = req?.filter(d => d.verificationStatus === "pending") || [];
  const approvedDocs = req?.filter(d => d.verificationStatus === "verified") || [];
  const rejectedDocs = req?.filter(d => d.verificationStatus === "rejected") || [];

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
                  {pendingDocs.map((doc) => <DocumentModalWithCard key={doc.id} doc={doc} />)}
                </div>
              </div>
            )}
      
            {/* All Requests */}
            <div className="space-y-4">
              <SectionHeader icon={FileCheck} title="All Verification Requests" color="text-gray-600" bg="bg-gray-100" />
              {req?.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                  {req?.map((doc) => <DocumentModalWithCard key={doc.id} doc={doc} />)}
                </div>
              )}
            </div>
   
    </div>
  );
}
