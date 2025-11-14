interface TagProps {
  label: string;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'danger';
}

const colorMap: Record<Required<TagProps>['color'], string> = {
  primary: 'bg-blue-100 text-blue-800',
  accent: 'bg-orange-100 text-orange-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
};

export const Tag = ({ label, color = 'primary' }: TagProps) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${colorMap[color]}`}>
    {label}
  </span>
);
