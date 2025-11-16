interface TagProps {
  label: string;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info';
}

const colorMap: Record<Required<TagProps>['color'], string> = {
  primary: 'bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 border border-indigo-200',
  accent: 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-200',
  success: 'bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border border-emerald-200',
  warning: 'bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 border border-amber-200',
  danger: 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200',
  info: 'bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-700 border border-cyan-200',
};

export const Tag = ({ label, color = 'primary' }: TagProps) => (
  <span 
    className={`
      inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold 
      shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105
      ${colorMap[color]}
    `}
  >
    {label}
  </span>
);
