import React from 'react'
import Client from './client'
import { getAllReports } from '@/lib/action/report';
import Header from '../__component/Header';
import StatsSection from '../__component/StatsSection';
import SearchFilter from '../__component/SearchFilter';
import { AlertTriangle, CheckCircle, Loader2, XCircle } from 'lucide-react';

const ReportPage = async ({ 
  searchParams 
}: { 
  searchParams: Promise<{ search?: string; status?: string }>; 
}) => {
  // 1. Await Params and Fetch Data
  const params = await searchParams;
  const query = params.search?.toLowerCase() || "";
  const statusFilter = params.status || "all";
  
  const result = await getAllReports();
  const allReports = result.data || [];

  // 2. Calculate Stats (Always based on ALL reports before filtering)
  const pendingCount = allReports.filter((r) => r.status === "pending").length;
  const activeCount = allReports.filter((r) =>
    ["reviewing", "in_progress", "almost_done"].includes(r.status)
  ).length;
  const resolvedCount = allReports.filter((r) => r.status === "resolved").length;
  const dismissedCount = allReports.filter((r) => r.status === "dismissed").length;

  // 3. Perform Server-Side Filtering
  const filteredReports = allReports.filter((report) => {
    // Status Check
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;

    // Search Check (Reason, ID, or Type)
    const matchesQuery = !query || (
      report.reason.toLowerCase().includes(query) ||
      report.id.toLowerCase().includes(query) ||
      report.type.toLowerCase().includes(query)
    );

    return matchesStatus && matchesQuery;
  });

  const statsItems = [
    { title: "Pending", count: pendingCount, Icon: AlertTriangle, variant: "default" as const },
    { title: "Active", count: activeCount, Icon: Loader2, variant: "pending" as const },
    { title: "Resolved", count: resolvedCount, Icon: CheckCircle, variant: "approved" as const },
    { title: "Dismissed", count: dismissedCount, Icon: XCircle, variant: "rejected" as const },
  ];

  const statusOptions = [
    { value: "all", label: "All" },
    { value: "pending", label: "Pending" },
    { value: "reviewing", label: "Reviewing" },
    { value: "in_progress", label: "In Progress" },
    { value: "almost_done", label: "Almost Done" },
    { value: "resolved", label: "Resolved" },
    { value: "dismissed", label: "Dismissed" },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Header 
          title="Reports Management" 
          subtitle="Review and resolve user-submitted reports" 
        />
        
        <StatsSection items={statsItems} />
        
        {/* The SearchFilter should push updates to the URL (searchParams) */}
        <SearchFilter status={statusOptions} />
      </div>

      {/* Pass the filtered data to the Client Component for display */}
      <Client reports={filteredReports} />
    </div>
  )
}

export default ReportPage