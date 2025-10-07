import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  showError?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  icon,
  showError = true,
  className,
  ...props
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        
        <input
          className={cn(
            "w-full py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400",
            "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            icon ? "pl-10 pr-4" : "px-4",
            error && "border-red-500 focus:border-red-500 focus:ring-red-500/20",
            className
          )}
          {...props}
        />
      </div>
      
      {showError && error && (
        <motion.p
          className="mt-1 text-sm text-red-400"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};