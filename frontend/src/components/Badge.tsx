import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  label: string;
  tone?: 'default' | 'success' | 'warning' | 'danger';
}

const toneClasses: Record<Required<BadgeProps>['tone'], string> = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  danger: 'bg-red-100 text-red-700',
};

export const Badge = ({ label, tone = 'default', className = '', ...props }: BadgeProps) => (
  <span className={`inline-flex rounded-md px-2 py-1 text-xs font-medium ${toneClasses[tone]} ${className}`} {...props}>
    {label}
  </span>
);
