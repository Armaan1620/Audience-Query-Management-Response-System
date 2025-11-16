import { ReactNode } from 'react';

interface TableProps {
  headers: string[];
  rows: ReactNode[][];
}

export const Table = ({ headers, rows }: TableProps) => (
  <div className="overflow-x-auto bg-white/90 backdrop-blur-sm rounded-2xl shadow-medium border border-slate-200/60 animate-fade-in">
    <table className="min-w-full divide-y divide-slate-200/60">
      <thead className="bg-gradient-to-r from-slate-50 to-indigo-50/30">
        <tr>
          {headers.map((header, index) => (
            <th 
              key={header} 
              className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider animate-slide-down"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100/60 bg-white">
        {rows.map((cells, rowIndex) => (
          <tr 
            key={rowIndex} 
            className="hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/30 transition-all duration-200 group animate-slide-up"
            style={{ animationDelay: `${rowIndex * 0.03}s` }}
          >
            {cells.map((cell, cellIndex) => (
              <td key={cellIndex} className="px-6 py-4 text-sm text-slate-700 group-hover:text-slate-900 transition-colors">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
