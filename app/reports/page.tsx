"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  AlertTriangle,
  User,
  BookOpen,
  HelpCircle,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Loader2,
  CircleDot,
  Image as ImageIcon,
  FileText,
  MessageSquare,
  ChevronRight,
  Plus,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Import your new Server Action
import { getMyReports } from "@/lib/action/report";
import Link from "next/link";

const STATUS_CONFIG = [
  {
    value: "pending",
    label: "Pending",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
  },
  {
    value: "reviewing",
    label: "Reviewing",
    icon: Eye,
    color: "text-blue-600",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
  },
  {
    value: "in_progress",
    label: "In Progress",
    icon: Loader2,
    color: "text-violet-600",
    bg: "bg-violet-500/10",
    border: "border-violet-500/30",
  },
  {
    value: "almost_done",
    label: "Almost Done",
    icon: CircleDot,
    color: "text-teal-600",
    bg: "bg-teal-500/10",
    border: "border-teal-500/30",
  },
  {
    value: "resolved",
    label: "Resolved",
    icon: CheckCircle,
    color: "text-emerald-600",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/30",
  },
  {
    value: "dismissed",
    label: "Dismissed",
    icon: XCircle,
    color: "text-muted-foreground",
    bg: "bg-muted",
    border: "border-border",
  },
];

export default function MyReports() {
  const router = useRouter();
  const { toast } = useToast();

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchReports = async () => {
    setLoading(true);
    const result = await getMyReports();

    if (result.success) {
      setReports(result.data);
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
      // Optional: If unauthorized, redirect to login
      if (result.message === "Unauthorized") router.push("/sign-in");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    if (statusFilter === "all") return reports;
    return reports.filter((r) => r.status === statusFilter);
  }, [reports, statusFilter]);

  const getStatusBadge = (status: string) => {
    const s = STATUS_CONFIG.find((sc) => sc.value === status);
    if (!s) return <Badge variant="outline">{status}</Badge>;
    const Icon = s.icon;
    return (
      <Badge
        variant="outline"
        className={`${s.bg} ${s.color} ${s.border} gap-1`}
      >
        <Icon className="w-3 h-3" />
        {s.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="w-4 h-4" />;
      case "book":
        return <BookOpen className="w-4 h-4" />;
      default:
        return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getTargetName = (report: any) => {
    if (report.type === "user" && report.reportedUsers?.length > 0) {
      return report.reportedUsers
        .map((u: any) => u.name || u.username)
        .join(", ");
    }
    if (report.type === "book" && report.reportedBooks?.length > 0) {
      return report.reportedBooks.map((b: any) => b.name).join(", ");
    }
    return "General Report";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      </div>
    );
  }

  const statusCounts = STATUS_CONFIG.map((s) => ({
    ...s,
    count: reports.filter((r) => r.status === s.value).length,
  }));

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-2xl pb-24">
        <div className="flex items-center justify-between mb-5">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back
          </Button>
          <Button size="sm" className="gap-1.5" asChild>
            <Link href="/reports/new">
              <Plus className="w-4 h-4" />
              New Report
            </Link>
          </Button>
        </div>

        <div className="mb-5">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            My Reports
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track the status of your submitted reports
          </p>
        </div>

        {/* Filter Badges */}
        {reports.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
            <button
              onClick={() => setStatusFilter("all")}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                statusFilter === "all"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
              }`}
            >
              All ({reports.length})
            </button>
            {statusCounts
              .filter((s) => s.count > 0)
              .map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    statusFilter === s.value
                      ? `${s.bg} ${s.color} ${s.border}`
                      : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                  }`}
                >
                  {s.label} ({s.count})
                </button>
              ))}
          </div>
        )}

        {/* List */}
        {filteredReports.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium">
                {reports.length === 0
                  ? "No reports submitted yet"
                  : "No reports match this filter"}
              </p>
              {reports.length === 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 gap-1.5"
                  onClick={() => router.push("/report")}
                >
                  <Plus className="w-3.5 h-3.5" />
                  Submit a Report
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="group flex items-center gap-3 p-3.5 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/20 transition-all cursor-pointer bg-card"
                onClick={() => router.push(`/reports/details-/${report.id}`)}
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {getTypeIcon(report.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {getStatusBadge(report.status)}

                    {(report.evidenceImages?.length ?? 0) > 0 && (
                      <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                        <ImageIcon className="w-3 h-3" />
                        {report.evidenceImages!.length}
                      </span>
                    )}

                    {/* Highlight if admin has added notes/questions */}
                    {report.adminNotes && (
                      <span className="text-[10px] text-primary flex items-center gap-0.5">
                        <MessageSquare className="w-3 h-3" />
                        Response
                      </span>
                    )}
                  </div>

                  <p className="text-sm font-medium text-foreground truncate">
                    {getTargetName(report)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {report.reason}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] text-muted-foreground hidden sm:block">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
