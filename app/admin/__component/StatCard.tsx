import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';
import React from 'react';

// Define the available styles matching your original design
type StatCardVariant = 'default' | 'pending' | 'approved' | 'rejected';

interface StatCardProps {
  title: string;
  count: number;
  Icon: LucideIcon;
  variant?: StatCardVariant; // Optional prop, defaults to 'default'
}

// Map variants to their specific Tailwind classes
const variantStyles = {
  default: {
    border: "border-slate-200",
    textTitle: "text-slate-600",
    textCount: "text-slate-900",
    iconBg: "bg-slate-100",
    iconColor: "text-slate-600",
  },
  pending: {
    border: "border-amber-200",
    textTitle: "text-amber-700",
    textCount: "text-amber-800",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  approved: {
    border: "border-emerald-200",
    textTitle: "text-emerald-700",
    textCount: "text-emerald-800",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  rejected: {
    border: "border-red-200",
    textTitle: "text-red-700",
    textCount: "text-red-800",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
  },
};

const StatCard = ({ title, count, Icon, variant = "default" }: StatCardProps) => {
  const styles = variantStyles[variant];

  return (
    <Card className={cn("shadow-sm hover:shadow-md transition-shadow", styles.border)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className={cn("text-sm font-medium", styles.textTitle)}>{title}</p>
            <p className={cn("text-2xl font-bold mt-1", styles.textCount)}>{count}</p>
          </div>
          <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", styles.iconBg)}>
            <Icon className={cn("h-6 w-6", styles.iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;