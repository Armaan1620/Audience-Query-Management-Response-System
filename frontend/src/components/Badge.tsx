import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'danger' | 'info';
}

const toneClasses: Record<Required<BadgeProps>['tone'], string> = {
  default: 'bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 border border-slate-200',
  success: 'bg-gradient-to-r from-emerald-100 to-green-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-gradient-to-r from-amber-100 to-yellow-50 text-amber-700 border border-amber-200',
  danger: 'bg-gradient-to-r from-red-100 to-rose-50 text-red-700 border border-red-200',
  info: 'bg-gradient-to-r from-indigo-100 to-blue-50 text-indigo-700 border border-indigo-200',
};

export const Badge = ({ label, tone = 'default', className = '', ...props }: BadgeProps) => (
  <span 
    className={`
      inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold 
      shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105
      ${toneClasses[tone]} ${className}
    `} 
    {...props}
  >
    {label}
  </span>
);
