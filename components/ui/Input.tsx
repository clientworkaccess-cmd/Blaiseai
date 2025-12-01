import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  id: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(({ label, id, ...props }, ref) => {
  return (
    <div className="w-full group">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium uppercase tracking-wider text-zinc-400 mb-2.5 ml-1 transition-colors group-focus-within:text-white">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          ref={ref}
          className="block w-full px-5 py-3.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all duration-300 text-sm hover:bg-white/10 hover:border-white/20 shadow-inner shadow-black/20"
          {...props}
        />
        {/* Glow effect on bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent scale-x-0 group-focus-within:scale-x-100 transition-transform duration-500" />
      </div>
    </div>
  );
});