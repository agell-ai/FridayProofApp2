import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';
import { Card } from '../Shared/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  gradient?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  gradient = false
}) => {
  return (
    <Card
      glowOnHover={true}
      className="p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-[var(--fg-muted)]">
            {title}
          </p>
          <p className="text-3xl font-bold mt-2 text-[var(--fg)]">
            {value}
          </p>
          {change && (
            <p className="text-sm mt-1 text-green-600">
              {change}
            </p>
          )}
        </div>
        <div className="p-3 rounded-lg bg-[var(--surface)]">
          <Icon className="w-6 h-6 text-[var(--fg-muted)]" />
        </div>
      </div>
    </Card>
  );
};

export default StatsCard;