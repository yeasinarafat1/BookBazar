import React from 'react';
import StatCard from './StatCard';
import { LucideIcon } from 'lucide-react';

// Define the shape of a single stat item
interface StatItem {
  title: string;
  count: number;
  Icon: LucideIcon;
  variant: 'default' | 'pending' | 'approved' | 'rejected';
}

const StatsSection = ({ items }: { items: StatItem[] }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item, index) => (
        <StatCard 
          key={index}
          title={item.title} 
          count={item.count} 
          Icon={item.Icon} 
          variant={item.variant} 
        />
      ))}
    </div>
  );
};

export default StatsSection;