import React from 'react';
import type { LucideIcon } from 'lucide-react';

import { Card } from '../Shared/Card';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  changeTone?: 'positive' | 'neutral' | 'warning' | 'critical';
  onClick?: () => void;
}

const toneStyles = {
  positive: 'text-emerald-600 dark:text-emerald-300',
  neutral: 'text-[var(--fg-muted)]',
  warning: 'text-amber-600 dark:text-amber-300',
  critical: 'text-rose-600 dark:text-rose-300',
};

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  changeTone = 'positive',
  onClick
}) => {
  const isInteractive = typeof onClick === 'function';

  return (
    <Card
      glowOnHover={isInteractive}
      className={`p-6 ${isInteractive ? 'transition-transform duration-300 hover:-translate-y-0.5' : ''}`}
      onClick={onClick}
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
            <p className={`text-sm mt-1 ${toneStyles[changeTone]}`}>
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