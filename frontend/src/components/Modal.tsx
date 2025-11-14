import { ReactNode } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export const Modal = ({ open, title, onClose, children }: ModalProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h4 className="text-lg font-semibold">{title}</h4>
          <button onClick={onClose} aria-label="Close" className="text-slate-500 hover:text-slate-900">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
