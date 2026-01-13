import { forwardRef } from "react";
import { format } from "date-fns";
import { 
  Phone, 
  Building2, 
  Sun, 
  CalendarDays, 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getStatusBadge } from "./helperComponents"; // Assuming this is where it lives based on your imports
import Image from "next/image";
import { VerificationRequest } from "@/db/Schemas/ProfileVerificationRequest";

interface DocumentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  doc: VerificationRequest;
  setImageLoading: (loading: boolean) => void;
}

// forwardRef is required when using DialogTrigger asChild
const DocumentCard = forwardRef<HTMLDivElement, DocumentCardProps>(
  ({ doc, setImageLoading, className, onClick, ...props }, ref) => {
    return (
      <Card
        ref={ref} // 1. Pass the ref for Dialog positioning
        className={cn(
          "group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border overflow-hidden text-left h-full",
          doc.verificationStatus === "pending"
            ? "border-amber-200 bg-linear-to-br from-amber-50/50 to-white"
            : doc.verificationStatus === "verified"
            ? "border-emerald-200 bg-linear-to-br from-emerald-50/50 to-white"
            : "border-rose-200 bg-linear-to-br from-rose-50/50 to-white",
          className
        )}
        onClick={(e) => {
          // 2. Run your custom logic
          setImageLoading(true);
          // 3. Run the Dialog's onClick (this actually opens the modal)
          if (onClick) onClick(e);
        }}
        {...props} // 4. Spread accessibility props from DialogTrigger
      >
        <CardContent className="p-0">
          {/* Status Bar */}
          <div
            className={cn(
              "h-2",
              doc.verificationStatus === "pending"
                ? "bg-linear-to-r from-amber-400 to-amber-500"
                : doc.verificationStatus === "verified"
                ? "bg-linear-to-r from-emerald-400 to-emerald-500"
                : "bg-linear-to-r from-rose-400 to-rose-500"
            )}
          />

          <div className="p-5">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-lg ring-2 ring-gray-100">
                  <Image
                  fill
                    src={doc.profile_pic}
                    alt={doc.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {doc.verificationStatus === "pending" && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full animate-pulse shadow-lg border-2 border-white">
                    <div className="absolute inset-0 rounded-full bg-amber-500 animate-ping opacity-75" />
                  </div>
                )}
              </div>

              {/* Card Text Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate text-lg">
                      {doc.name}
                    </h3>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5" /> {doc.phoneNo}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge
                    variant="outline"
                    className="text-xs font-medium border-gray-200 bg-white/80"
                  >
                    <Building2 className="w-3 h-3 mr-1" />
                    {doc.department}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-xs font-medium border-gray-200 bg-white/80"
                  >
                    <Sun className="w-3 h-3 mr-1" />
                    {doc.shift}
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
  }
);

DocumentCard.displayName = "DocumentCard";

export default DocumentCard;