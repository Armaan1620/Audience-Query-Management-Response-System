import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  title: string | ReactNode;
  description?: string | ReactNode;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const Card = ({ title, description, children, className = '', style }: CardProps) => (
  <div 
    className={`
      group relative
      rounded-2xl 
      bg-white/90 backdrop-blur-sm
      border border-slate-200/60
      p-6 
      shadow-soft
      hover:shadow-medium
      transition-all duration-300
      hover:border-indigo-200/60
      hover:-translate-y-1
      animate-fade-in
      ${className}
    `}
    style={style}
  >
    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-indigo-500/5 group-hover:via-purple-500/5 group-hover:to-pink-500/5 transition-all duration-500 pointer-events-none" />
    <div className="relative">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-slate-500 mt-1">{description}</p>
        )}
      </div>
      {children}
    </div>
  </div>
);
