import { BookOpen, HelpCircle, User } from "lucide-react";
import { REPORT_STATUSES } from "../client";
import { Badge } from "@/components/ui/badge";

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
  export { getReportTypeIcon, getStatusBadge };