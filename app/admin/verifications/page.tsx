import { getAllVerificationRequests } from "@/lib/action/admin";
import Header from "../__component/Header";
import StatsSection from "../__component/StatsSection";
import { AlertCircle, CheckCircle, Clock, FileCheck, XCircle } from "lucide-react";
import { EmptyState, SectionHeader } from "./__component/helperComponents";
import DocumentModalWithCard from "./__component/DocumentModalWIthCard";
import { title } from "process";

export default async function VerificationsPage() {
  const req = await getAllVerificationRequests();
  
  const pendingDocs = req?.filter(d => d.verificationStatus === "pending") || [];
  const approvedDocs = req?.filter(d => d.verificationStatus === "verified") || [];
  const rejectedDocs = req?.filter(d => d.verificationStatus === "rejected") || [];

  // Configure the stats for the reusable component
  const statsItems = [
    {
      title: "Total Requests",
      count: req?.length || 0,
      Icon: FileCheck,
      variant: "default" as const, // Uses your default style
    },
    {
      title: "Pending Review",
      count: pendingDocs.length,
      Icon: Clock,
      variant: "pending" as const, // Uses your Amber style
    },
    {
      title: "Verified",
      count: approvedDocs.length,
      Icon: CheckCircle,
      variant: "approved" as const, // Uses your Emerald style
    },
    {
      title: "Rejected",
      count: rejectedDocs.length,
      Icon: XCircle,
      variant: "rejected" as const, // Uses your Red style
    },
  ];

  return (
    <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen">
      
      {/* 1. Page Header */}
      <Header 
        title="Verification Requests" 
        subtitle="Review student documents and manage identity verification." 
      />

      {/* 2. Stats Section (Replaces the manual grid) */}
      <StatsSection items={statsItems} />

      {/* 3. Pending Section */}
      {pendingDocs.length > 0 && (
        <div className="space-y-4">
          <SectionHeader 
            icon={AlertCircle} 
            title="Pending Verification Requests" 
            color="text-amber-600" 
            bg="bg-amber-100" 
          />
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {pendingDocs.map((doc) => (
              <DocumentModalWithCard key={doc.id} doc={doc} />
            ))}
          </div>
        </div>
      )}

      {/* 4. All Requests Section */}
      <div className="space-y-4">
        <SectionHeader 
          icon={FileCheck} 
          title="All Verification Requests" 
          color="text-gray-600" 
          bg="bg-gray-100" 
        />
        
        {req?.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {req?.map((doc) => (
              <DocumentModalWithCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}