import { ReactNode, useEffect } from 'react';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export const Modal = ({ open, title, onClose, children }: ModalProps) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in p-4"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-lg rounded-2xl bg-white/95 backdrop-blur-lg p-6 shadow-large border border-slate-200/60 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h4 className="text-xl font-bold text-slate-900">{title}</h4>
          <button 
            onClick={onClose} 
            aria-label="Close" 
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200 hover:scale-110"
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
