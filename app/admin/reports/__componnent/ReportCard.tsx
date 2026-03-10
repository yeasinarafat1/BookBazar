import { Badge } from '@/components/ui/badge';
import { ReportType } from '@/db/Schemas/report';
import {  BookOpen, ChevronRight, HelpCircle, ImageIcon, User } from 'lucide-react'
import React from 'react'
import { getReportTypeIcon, getStatusBadge } from './helper';

const ReportCard = ({ report, handleOpenReview }:{
  report: ReportType; // Replace with actual report type
  handleOpenReview: (report: any) => void; // Replace with actual report type
}) => {
  return (
    <div
                  key={report.id}
                  className="group flex items-center gap-4 p-3.5 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/20 transition-all cursor-pointer"
                  onClick={() => handleOpenReview(report)}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    {getReportTypeIcon(report.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      {getStatusBadge(report.status)}

                      {/* @ts-ignore - Assuming reportedUsers exists on the joined query */}
                      {report.reportedUsers?.length > 1 || report.reportedBooks?.length > 1 ? (
                        <Badge variant="secondary" className="text-[10px] h-5">
                          {/* @ts-ignore */}
                          {(report.reportedUsers?.length || 0) + (report.reportedBooks?.length || 0)} targets
                        </Badge>
                      ) : null}

                      {report.evidenceImages && report.evidenceImages.length > 0 && (
                        <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                          <ImageIcon className="w-3 h-3" />
                          {report.evidenceImages.length}
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground truncate">
                      {/* @ts-ignore */}
                      {report.reportedUsers?.map((u: any) => u.name || u.username).join(", ") ||
                        // @ts-ignore
                        report.reportedBooks?.map((b: any) => b.name).join(", ") ||
                        "General Report"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {report.reason}
                    </p>
                  </div>

                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0">
                    <p className="text-xs text-muted-foreground">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {/* @ts-ignore */}
                      by {report.reporter?.name || report.reporter?.username || "Unknown"}
                    </p>
                  </div>

                  <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
                </div>
  )
}

export default ReportCard