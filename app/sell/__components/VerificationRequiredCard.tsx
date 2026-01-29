import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowRight, CheckCircle2, ShieldCheck, Sparkles, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const VerificationRequiredCard = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-4 md:p-6 bg-background">
      <Card className="w-full max-w-4xl border-border shadow-card overflow-hidden bg-card">
        
        <div className="grid md:grid-cols-2 gap-0">
          {/* Left Column - Header & Description */}
          <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 px-6 md:px-10 py-8 md:py-10 border-b md:border-b-0 md:border-r border-border/50">
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mb-16"></div>
            
            <div className="relative h-full flex flex-col">
              {/* Icon */}
              <div className="h-14 w-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4 ring-1 ring-primary/20">
                <ShieldCheck className="h-7 w-7 text-primary" strokeWidth={2.5} />
              </div>
              
              {/* Title */}
              <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                Verification Required
              </h1>
              
              {/* Subtitle */}
              <p className="text-sm text-muted-foreground mb-6">
                Join our trusted community of verified sellers
              </p>

              {/* Description */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                To maintain a safe marketplace for all students, please verify your identity before listing books for sale.
              </p>

              {/* Benefits Grid */}
              <div className="grid grid-cols-3 gap-3 mt-auto">
                <div className="text-center p-3 rounded-lg bg-background/50 border border-primary/10">
                  <Sparkles className="h-5 w-5 text-primary mx-auto mb-1.5" strokeWidth={2} />
                  <p className="text-xs font-medium text-foreground">Trusted</p>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-background/50 border border-primary/10">
                  <TrendingUp className="h-5 w-5 text-primary mx-auto mb-1.5" strokeWidth={2} />
                  <p className="text-xs font-medium text-foreground">Visibility</p>
                </div>
                
                <div className="text-center p-3 rounded-lg bg-background/50 border border-primary/10">
                  <Users className="h-5 w-5 text-primary mx-auto mb-1.5" strokeWidth={2} />
                  <p className="text-xs font-medium text-foreground">Community</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Benefits */}
          <div className="px-6 md:px-10 py-8 md:py-10 flex flex-col justify-between">
            <div>
              {/* Benefits List */}
              <div className="mb-8">
                <p className="text-sm font-semibold text-foreground mb-4">
                  What you'll get
                </p>
                
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span><span className="text-foreground font-medium">Verified badge</span> on your profile</span>
                  </li>
                  
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span><span className="text-foreground font-medium">Higher visibility</span> in search results</span>
                  </li>
                  
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span><span className="text-foreground font-medium">Buyer trust</span> for faster sales</span>
                  </li>
                  
                  <li className="flex items-start gap-3 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" strokeWidth={2.5} />
                    <span><span className="text-foreground font-medium">Secure transactions</span> guaranteed</span>
                  </li>
                </ul>
              </div>

              {/* Security Note */}
              <div className="bg-muted/50 rounded-lg p-3 border border-border mb-6">
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span className="text-primary">🔒</span> Your data is encrypted and protected
                </p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="space-y-2.5">
              <Link href="/profile/verify" className="w-full block">
                <Button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-sm">
                  Start Verification <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              
              <Link href="/" className="w-full block">
                <Button variant="ghost" className="w-full h-10 text-muted-foreground hover:text-foreground hover:bg-secondary">
                  Maybe Later
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default VerificationRequiredCard