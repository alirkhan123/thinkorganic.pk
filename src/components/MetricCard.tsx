import React from 'react';

interface MetricCardProps {
  label: string;
  value: string;
  subValue?: string;
  badge?: string;
  badgeType?: 'neutral' | 'success' | 'warning' | 'accent';
  trend?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  subValue,
  badge,
  badgeType = 'neutral',
}) => {
  const getBadgeStyle = () => {
    switch (badgeType) {
      case 'success':
        return 'text-emerald-700 bg-emerald-50 border border-emerald-200';
      case 'warning':
        return 'text-amber-800 bg-amber-50 border border-amber-200';
      case 'accent':
        return 'text-stone-900 bg-amber-300 font-semibold';
      default:
        return 'text-stone-600 bg-stone-100 border border-stone-200';
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs hover:border-stone-300 transition-colors">
      <div className="flex items-center justify-between gap-2 mb-1.5">
        <span className="text-xs font-medium text-stone-500 uppercase tracking-wider">
          {label}
        </span>
        {badge && (
          <span className={`text-[11px] px-2 py-0.5 rounded ${getBadgeStyle()}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-stone-900 font-mono tracking-tight tabular-nums">
        {value}
      </div>
      {subValue && (
        <div className="mt-1 text-xs text-stone-500">
          {subValue}
        </div>
      )}
    </div>
  );
};
