import React from 'react';
import ReactDOM from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fadeIn" 
            aria-hidden="true" 
            onClick={onClose}
        />

        <div
          className="relative transform overflow-hidden rounded-3xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 text-left shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all sm:my-8 sm:w-full sm:max-w-lg animate-fadeIn"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-6 sm:p-8">
            <div className="sm:flex sm:items-start">
              <div className="text-center sm:text-left w-full">
                <h3 className="text-2xl font-bold leading-6 text-white font-display" id="modal-title">
                  {title}
                </h3>
                <div className="mt-6">
                  {children}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white/5 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-8 border-t border-white/5">
            <button
              type="button"
              className="inline-flex w-full justify-center rounded-xl bg-white text-zinc-950 px-5 py-3 text-sm font-bold shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:bg-zinc-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-zinc-900 sm:ml-3 sm:w-auto transition-all duration-200"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};