import { ReactNode } from 'react';

interface TableProps {
  headers: string[];
  rows: ReactNode[][];
}

export const Table = ({ headers, rows }: TableProps) => (
  <div className="overflow-x-auto bg-white rounded-xl shadow-sm">
    <table className="min-w-full divide-y divide-slate-200">
      <thead className="bg-slate-50">
        <tr>
          {headers.map((header) => (
            <th key={header} className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {rows.map((cells, rowIndex) => (
          <tr key={rowIndex} className="hover:bg-slate-50">
            {cells.map((cell, cellIndex) => (
              <td key={cellIndex} className="px-4 py-3 text-sm text-slate-700">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
