"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  BookOpen,
  HelpCircle,
  Image as ImageIcon,
  Clock,
  Eye,
  ExternalLink,
  Calendar,
  Loader2,
  CircleDot,
  MessageSquare,
  Shield,
  ChevronRight,
  Save,
  Send,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import Link from "next/link";

// Server Actions
import {
  getReportMessages,
  sendAdminMessage,
  updateReportStatus,
} from "@/lib/action/report";
import { ReportType } from "@/db/Schemas/report";
import ReportCard from "./__componnent/ReportCard";

export const REPORT_STATUSES = [
  { value: "pending", label: "Pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { value: "reviewing", label: "Reviewing", icon: Eye, color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { value: "in_progress", label: "In Progress", icon: Loader2, color: "text-violet-600", bg: "bg-violet-500/10", border: "border-violet-500/30" },
  { value: "almost_done", label: "Almost Done", icon: CircleDot, color: "text-teal-600", bg: "bg-teal-500/10", border: "border-teal-500/30" },
  { value: "resolved", label: "Resolved", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { value: "dismissed", label: "Dismissed", icon: XCircle, color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
];

const Client = ({ reports }: { reports: ReportType[] }) => {
  const router = useRouter();
  const { toast } = useToast();

  // Cleaned up states - only keeping what is needed for UI interactions
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [processing, setProcessing] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  // Messaging states
  const [reportMessages, setReportMessages] = useState<any[]>([]);
  const [adminMessage, setAdminMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async (reportId: string) => {
    const result = await getReportMessages(reportId);
    if (result.success) setReportMessages(result.data);
  };

  // Auto-scroll messages
  useEffect(() => {
    if (reportMessages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [reportMessages]);

  // --- Handlers ---
  const handleSendAdminMessage = async () => {
    if (!adminMessage.trim() || !selectedReport) return;
    setSendingMessage(true);

    const result = await sendAdminMessage(
      selectedReport.reporter.id,
      selectedReport.id,
      adminMessage.trim()
    );

    if (result.success) {
      setAdminMessage("");
      fetchMessages(selectedReport.id);
      toast({
        title: "Message sent",
        description: "The user will see your message.",
      });
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
    setSendingMessage(false);
  };

  const handleUpdateStatus = async () => {
    if (!selectedReport || !selectedStatus) return;
    setProcessing(true);

    const result = await updateReportStatus(
      selectedReport.reporter.id,
      selectedReport.id,
      selectedStatus,
      adminNotes
    );

    if (result.success) {
      toast({
        title: "Status Updated",
        description: `Report status changed to "${REPORT_STATUSES.find((s) => s.value === selectedStatus)?.label}"`,
      });
      setSelectedReport(null);
      
      // Tell Next.js to re-fetch the server component data
      router.refresh(); 
    } else {
      toast({
        title: "Error",
        description: result.message,
        variant: "destructive",
      });
    }
    setProcessing(false);
  };

  const handleOpenReview = (report: any) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || "");
    setSelectedStatus(report.status);
    setReportMessages([]);
    setAdminMessage("");
    fetchMessages(report.id);
  };

  // --- Helpers ---
  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case "user": return <User className="w-4 h-4" />;
      case "book": return <BookOpen className="w-4 h-4" />;
      default: return <HelpCircle className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const s = REPORT_STATUSES.find((rs) => rs.value === status);
    if (!s) return <Badge variant="outline">{status}</Badge>;
    const Icon = s.icon;
    return (
      <Badge variant="outline" className={`${s.bg} ${s.color} ${s.border} gap-1`}>
        <Icon className="w-3 h-3" /> {s.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* List */}
      <Card>
        <CardContent>
          {reports.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No reports found</p>
            </div>
          ) : (
            <div className="space-y-2 pt-4">
              {reports.map((report) => (
                <ReportCard key={report.id} report={report} handleOpenReview={handleOpenReview} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Review Dialog --- */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" /> Review Report
            </DialogTitle>
            <DialogDescription>
              Review details and update the status of this report.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className="space-y-5">
              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  {getReportTypeIcon(selectedReport.type)}
                  <span className="capitalize">{selectedReport.type} Report</span>
                </div>
                {getStatusBadge(selectedReport.status)}
              </div>

              {/* Target Users */}
              {selectedReport.reportedUsers?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Reported User(s)
                  </h4>
                  {selectedReport.reportedUsers.map((tu: any) => (
                    <div key={tu.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 overflow-hidden relative flex items-center justify-center">
                          {tu.profile_pic ? (
                            <Image src={tu.profile_pic} alt="" fill className="object-cover" />
                          ) : (
                            <User className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tu.name || tu.username}</p>
                          <p className="text-xs text-muted-foreground">@{tu.username}</p>
                        </div>
                      </div>
                      <Button asChild variant="ghost" size="sm" className="gap-1 text-xs h-7">
                        <Link href={`/profile/${tu.username}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3" /> View
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Target Books */}
              {selectedReport.reportedBooks?.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Reported Book(s)
                  </h4>
                  {selectedReport.reportedBooks.map((tb: any) => (
                    <div key={tb.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-12 rounded-md bg-muted overflow-hidden relative flex items-center justify-center border border-border">
                          {tb.pic ? (
                            <Image src={tb.pic} alt="" fill className="object-cover" />
                          ) : (
                            <BookOpen className="w-4 h-4 text-muted-foreground" />
                          )}
                        </div>
                        <p className="text-sm font-medium">{tb.name}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="gap-1 text-xs h-7" onClick={() => router.push(`/book/${tb.slug}`)}>
                        <ExternalLink className="w-3 h-3" /> View
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Reason */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                  Reason
                </h4>
                <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
                  <p className="text-sm leading-relaxed">{selectedReport.reason}</p>
                </div>
              </div>

              {/* Evidence Images */}
              {selectedReport.evidenceImages?.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" /> Evidence ({selectedReport.evidenceImages.length})
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedReport.evidenceImages.map((url: string, index: number) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden border border-border cursor-pointer hover:ring-2 hover:ring-primary/50 relative"
                        onClick={() => setImagePreview(url)}
                      >
                        <Image src={url} alt={`Evidence ${index + 1}`} fill className="object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reporter Info (RESTORED) */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground px-3 py-2 rounded-lg bg-muted/20">
                <span className="flex items-center gap-1.5">
                  <User className="w-3 h-3" />
                  {/* @ts-ignore */}
                  {selectedReport.reporter?.name || selectedReport.reporter?.username}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" />
                  {new Date(selectedReport.createdAt).toLocaleString()}
                </span>
              </div>

              {/* Communication / Request Info (RESTORED) */}
              <div className="border-t border-border pt-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5" /> Request More Info
                </h4>

                {reportMessages.length > 0 && (
                  <div className="space-y-3 mb-3 max-h-48 overflow-y-auto pr-2">
                    {reportMessages.map((msg) => (
                      <div
                        key={msg.id}
                        className={msg.isAdmin ? "" : "ml-5 pl-3 border-l-2 border-emerald-500/30"}
                      >
                        <div className={`flex items-start gap-2 ${msg.isAdmin ? "p-3 rounded-lg border bg-muted/20" : ""}`}>
                          {msg.isAdmin ? (
                            <Shield className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-muted-foreground mb-0.5">
                              {msg.isAdmin ? "You asked" : "Reporter replied"} ·{" "}
                              {new Date(msg.createdAt).toLocaleString()}
                            </p>
                            <p className="text-sm">{msg.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}

                <div className="flex gap-2 items-end">
                  <Textarea
                    placeholder="Ask the reporter for more details..."
                    value={adminMessage}
                    onChange={(e) => setAdminMessage(e.target.value)}
                    rows={2}
                    className="resize-none text-sm flex-1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleSendAdminMessage}
                    disabled={!adminMessage.trim() || sendingMessage}
                    className="shrink-0 gap-1.5 h-auto py-2"
                  >
                    <Send className="w-4 h-4" /> Request
                  </Button>
                </div>
              </div>

              {/* Update Status & Notes */}
              <div className="border-t border-border pt-4 space-y-4">
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" /> Admin Notes
                  </label>
                  <Textarea
                    placeholder="Add internal notes about your decision..."
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    className="resize-none text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
                    Update Status
                  </label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus} disabled={processing}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select status..." />
                    </SelectTrigger>
                    <SelectContent>
                      {REPORT_STATUSES.map((s) => {
                        const Icon = s.icon;
                        return (
                          <SelectItem key={s.value} value={s.value}>
                            <span className="flex items-center gap-2">
                              <Icon className={`w-3.5 h-3.5 ${s.color}`} />
                              {s.label}
                            </span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  className="w-full gap-2"
                  onClick={handleUpdateStatus}
                  disabled={processing || (selectedStatus === selectedReport.status && adminNotes === (selectedReport.adminNotes || ""))}
                >
                  <Save className="w-4 h-4" /> {processing ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Full Screen Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-4xl p-1 bg-transparent border-none shadow-none">
          {imagePreview && (
            <div className="relative w-full h-[80vh]">
              <Image src={imagePreview} alt="Evidence Full" fill className="object-contain" />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Client;