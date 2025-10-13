import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps {
  variant?: 'default' | 'ghost' | 'outline' | 'glow' | 'accent';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  type?: 'button' | 'submit' | 'reset';
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'default',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = "relative inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
    ghost: "text-foreground hover:bg-accent/10 hover:text-accent-foreground",
    outline: "border border-border text-foreground hover:bg-accent hover:text-accent-foreground",
    glow: "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-400 hover:to-purple-500 focus:ring-blue-500 shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40",
    accent: "bg-accent text-accent-foreground hover:bg-accent/90 focus:ring-accent font-semibold"
  };
  
  const sizes = {
    sm: "h-9 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    icon: "h-10 w-10"
  };

  return (
    <motion.button
      ref={ref}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseClasses, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      onClick={onClick}
      type={type}
    >
      {variant === 'glow' && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 opacity-0 blur-xl"
          animate={{
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
      
      <span className="relative z-10 flex items-center gap-2">
        {isLoading && (
          <motion.div
            className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
        )}
        {children}
      </span>
    </motion.button>
  );
});

Button.displayName = 'Button';