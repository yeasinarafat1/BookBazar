"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, User, BookOpen, HelpCircle, Clock, Eye,
  CheckCircle, XCircle, Loader2, CircleDot,
  Image as ImageIcon, FileText, MessageSquare, Calendar, Send, Shield,
} from 'lucide-react';

// Import the Server Actions
import { getReportById, getReportMessages, sendUserMessage } from '@/lib/action/report';

const STATUS_CONFIG = [
  { value: "pending", label: "Pending", icon: Clock, color: "text-amber-600", bg: "bg-amber-500/10", border: "border-amber-500/30" },
  { value: "reviewing", label: "Reviewing", icon: Eye, color: "text-blue-600", bg: "bg-blue-500/10", border: "border-blue-500/30" },
  { value: "in_progress", label: "In Progress", icon: Loader2, color: "text-violet-600", bg: "bg-violet-500/10", border: "border-violet-500/30" },
  { value: "almost_done", label: "Almost Done", icon: CircleDot, color: "text-teal-600", bg: "bg-teal-500/10", border: "border-teal-500/30" },
  { value: "resolved", label: "Resolved", icon: CheckCircle, color: "text-emerald-600", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  { value: "dismissed", label: "Dismissed", icon: XCircle, color: "text-muted-foreground", bg: "bg-muted", border: "border-border" },
];

export default function ReportDetail() {
  const router = useRouter();
  const params = useParams<{ id: string }>(); // Get ID from Next.js app router
  const { toast } = useToast();
  
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<any[]>([]);
  const [replyMessages, setReplyMessages] = useState<Record<string, string>>({});
  const [sending, setSending] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Fetch
  useEffect(() => {
    if (params?.id) {
      fetchReportData();
      fetchMessagesData();
    }
  }, [params?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchReportData = async () => {
    try {
      const result = await getReportById(params!.id);
      if (result.success) {
        setReport(result.data);
      } else {
        toast({ title: "Error", description: result.message, variant: "destructive" });
        if (result.message === "Unauthorized") router.push('/sign-in');
      }
    } catch (err) {
      console.error('Error fetching report:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesData = async () => {
    const result = await getReportMessages(params!.id);
    if (result.success) setMessages(result.data);
  };

  const handleSendMessage = async (adminMsgId: string) => {
    const text = replyMessages[adminMsgId]?.trim();
    if (!text || !params?.id) return;
    
    setSending(adminMsgId);
    try {
      const result = await sendUserMessage(params.id, text);
      if (result.success) {
        setReplyMessages(prev => ({ ...prev, [adminMsgId]: '' }));
        fetchMessagesData(); // Refresh messages
      } else {
        toast({ title: 'Error', description: result.message, variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to send message', variant: 'destructive' });
    } finally {
      setSending(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = STATUS_CONFIG.find(sc => sc.value === status);
    if (!s) return <Badge variant="outline">{status}</Badge>;
    const Icon = s.icon;
    return (
      <Badge variant="outline" className={`${s.bg} ${s.color} ${s.border} gap-1 text-sm px-3 py-1`}>
        <Icon className="w-3.5 h-3.5" />
        {s.label}
      </Badge>
    );
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="w-5 h-5" />;
      case 'book': return <BookOpen className="w-5 h-5" />;
      default: return <HelpCircle className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 py-10 max-w-2xl text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
          <p className="text-muted-foreground">Report not found</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => router.push('/reports')}>
            Back to My Reports
          </Button>
        </main>
      </div>
    );
  }

  const currentIdx = STATUS_CONFIG.findIndex(sc => sc.value === report.status);

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-6 max-w-2xl pb-24">
        <Button variant="ghost" size="sm" onClick={() => router.push('/my-reports')} className="mb-5">
          <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Reports
        </Button>

        {/* Header Card */}
        <div className="rounded-2xl border border-border bg-card p-5 mb-4 shadow-sm">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
              {getTypeIcon(report.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground capitalize">
                  {report.type} Report
                </span>
              </div>
              {getStatusBadge(report.status)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3.5 h-3.5" />
            Submitted {new Date(report.createdAt).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="rounded-2xl border border-border bg-card p-5 mb-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Progress</h3>
          <div className="flex items-center gap-1">
            {STATUS_CONFIG.slice(0, -1).map((s, i) => {
              const isActive = i <= currentIdx && report.status !== "dismissed";
              return (
                <div key={s.value} className="flex-1 flex flex-col items-center gap-1.5">
                  <div className={`w-full h-2 rounded-full transition-colors ${isActive ? "bg-primary" : "bg-muted"}`} />
                  <span className={`text-[10px] leading-tight text-center ${isActive ? "text-primary font-medium" : "text-muted-foreground"}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          {report.status === "dismissed" && (
            <p className="text-xs text-muted-foreground mt-3 text-center">This report has been dismissed.</p>
          )}
        </div>

        {/* Targets (Iterating arrays mapped in server action) */}
        {(report.reportedUsers?.length > 0 || report.reportedBooks?.length > 0) && (
          <div className="rounded-2xl border border-border bg-card p-5 mb-4 shadow-sm space-y-4">
            
            {/* Users */}
            {report.reportedUsers?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Reported User{report.reportedUsers.length > 1 ? 's' : ''}
                </h3>
                <div className="space-y-2">
                  {report.reportedUsers.map((u: any) => (
                    <div key={u.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative">
                        {u.profile_pic ? <img src={u.profile_pic} alt="" className="object-cover w-full h-full" /> : <User className="w-5 h-5 text-primary" />}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.name || u.username}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Books */}
            {report.reportedBooks?.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Reported Book{report.reportedBooks.length > 1 ? 's' : ''}
                </h3>
                <div className="space-y-2">
                  {report.reportedBooks.map((b: any) => (
                    <div key={b.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/20">
                      <div className="w-11 h-14 rounded-lg bg-muted overflow-hidden flex items-center justify-center border border-border">
                        {b.pic ? (
                          <img src={b.pic} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <p className="text-sm font-medium">{b.title}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reason */}
        <div className="rounded-2xl border border-border bg-card p-5 mb-4 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Reason</h3>
          <div className="p-3.5 rounded-xl bg-destructive/5 border border-destructive/20">
            <p className="text-sm leading-relaxed">{report.reason}</p>
          </div>
        </div>

        {/* Evidence Images */}
        {report.evidenceImages?.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-5 mb-4 shadow-sm">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              Evidence ({report.evidenceImages.length})
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {report.evidenceImages.map((url: string, i: number) => (
                <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                    <img
                    src={url}
                    alt={`Evidence ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-xl border border-border hover:opacity-80 transition-opacity"
                    />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Admin Note */}
        {report.adminNotes && (
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5" />
              Admin Note
            </h3>
            <p className="text-sm leading-relaxed text-primary/90">{report.adminNotes}</p>
          </div>
        )}

        {/* Message Thread */}
        {messages.length > 0 && (
          <div className="space-y-3 mb-4">
            {messages.filter(m => m.isAdmin).map((adminMsg) => {
              // Find the reply to this specific admin message
              const userReply = messages.find(
                m => !m.isAdmin && new Date(m.createdAt) > new Date(adminMsg.createdAt)
              );
              const nextAdminMsg = messages.find(
                m => m.isAdmin && m.id !== adminMsg.id && new Date(m.createdAt) > new Date(adminMsg.createdAt)
              );
              const pairedReply = userReply && (!nextAdminMsg || new Date(userReply.createdAt) < new Date(nextAdminMsg.createdAt))
                ? userReply : null;

              return (
                <div key={adminMsg.id} className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-full bg-amber-500/15 flex items-center justify-center">
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-500">Admin requested more info</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(adminMsg.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-relaxed mb-3 text-amber-900 ">{adminMsg.message}</p>

                  {pairedReply ? (
                    <div className="rounded-xl bg-background border border-border p-3.5">
                      <div className="flex items-center gap-1.5 mb-1">
                        <CheckCircle className="w-3 h-3 text-emerald-500" />
                        <span className="text-[10px] font-medium text-emerald-600">You responded</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(pairedReply.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-sm leading-relaxed">{pairedReply.message}</p>
                    </div>
                  ) : (
                    <div className="rounded-xl bg-background border border-border p-3.5">
                      <div className="flex gap-2 items-end">
                        <Textarea
                          placeholder="Provide the requested details..."
                          value={replyMessages[adminMsg.id] || ''}
                          onChange={(e) => setReplyMessages(prev => ({ ...prev, [adminMsg.id]: e.target.value }))}
                          rows={2}
                          className="resize-none text-sm flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(adminMsg.id);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSendMessage(adminMsg.id)}
                          disabled={!(replyMessages[adminMsg.id]?.trim()) || sending === adminMsg.id}
                          className="shrink-0 gap-1.5"
                        >
                          {sending === adminMsg.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                          Reply
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>
    </div>
  );
}