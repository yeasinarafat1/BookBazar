"use client"

import Link from "next/link"
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  ArrowLeft, 
  AlertCircle,
  RefreshCw 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface VerificationStatusProps {
  status: 'pending' | 'verified' | 'rejected';
  feedback?: string | null;
  onResubmit?: () => void;
}

export function VerificationStatus({ status, feedback, onResubmit }: VerificationStatusProps) {
  
  // Configuration for different states
  const config = {
    pending: {
      icon: Clock,
      iconColor: "text-amber-600",
      iconBg: "bg-amber-100",
      title: "Verification Pending",
      description: "We have received your request. Our team is currently reviewing your documents. This usually takes 24–48 hours."
    },
    verified: {
      icon: CheckCircle2,
      iconColor: "text-emerald-600",
      iconBg: "bg-emerald-100",
      title: "You are Verified!",
      description: "Congratulations! Your student profile has been verified. You now have full access to all verified features."
    },
    rejected: {
      icon: XCircle,
      iconColor: "text-red-600",
      iconBg: "bg-red-100",
      title: "Verification Rejected",
      description: "We couldn't verify your profile based on the information provided. Please review the feedback below and try again."
    }
  }

  const state = config[status];
  const Icon = state.icon;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full px-4 animate-in fade-in zoom-in-95 duration-500">
      
      {/* Floating Back Link */}
      <div className="w-full max-w-lg mb-6">
        <Link 
          href='/profile' 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Profile
        </Link>
      </div>

      <Card className="w-full max-w-lg text-center shadow-lg border-muted/40">
        
        {/* Icon & Title Section */}
        <div className="pt-10 pb-6 px-6 flex flex-col items-center">
          <div className={cn(
            "h-20 w-20 rounded-full flex items-center justify-center mb-5",
            state.iconBg
          )}>
             <Icon className={cn("h-10 w-10", state.iconColor)} strokeWidth={2} />
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight mb-2">
            {state.title}
          </h2>
          
          <p className="text-muted-foreground text-sm sm:text-base max-w-sm mx-auto">
            {state.description}
          </p>
        </div>
        
        <CardContent className="px-6 pb-6">
          {/* Enhanced Rejection Feedback Box */}
          {status === 'rejected' && feedback && (
            <div className="mt-2 bg-red-50 border border-red-100 rounded-xl p-4 text-left shadow-sm">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-red-900">
                    Admin Feedback
                  </h4>
                  <p className="text-sm text-red-700 leading-relaxed">
                    {feedback}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className={cn(
          "flex flex-col sm:flex-row justify-center gap-3 px-6 pb-8 pt-2",
          status === 'rejected' ? "sm:justify-between" : ""
        )}>
          {status === 'rejected' ? (
            <>
              <Button variant="ghost" className="w-full sm:w-auto order-2 sm:order-1" asChild>
                <Link href="/profile">Cancel</Link>
              </Button>
              <Button 
                onClick={onResubmit} 
                className="w-full sm:w-auto order-1 sm:order-2 gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Update & Resubmit
              </Button>
            </>
          ) : (
            <Button variant="outline" asChild className="min-w-[150px]">
              <Link href="/profile">Return to Profile</Link>
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}