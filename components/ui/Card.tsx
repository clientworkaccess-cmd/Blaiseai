import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
  title?: string;
  description?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '', noPadding = false, title, description }) => {
  return (
    <div className={`relative bg-zinc-900/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl ${className}`}>
      {(title || description) && (
        <div className="px-6 py-5 border-b border-white/10">
             {title && <h3 className="text-lg font-semibold text-white font-display">{title}</h3>}
             {description && <p className="mt-1 text-sm text-zinc-400">{description}</p>}
        </div>
      )}
      <div className={`${noPadding ? '' : 'p-6'}`}>
        {children}
      </div>
    </div>
  );
};