import { ReactNode } from 'react';

interface CardProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export const Card = ({ title, description, children }: CardProps) => (
  <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
    <div className="mb-4">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-slate-500">{description}</p>}
    </div>
    {children}
  </div>
);
