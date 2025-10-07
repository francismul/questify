import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  showText?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  progress,
  size = 'md',
  color = 'blue',
  showText = true,
  className,
  children
}) => {
  const sizes = {
    sm: { width: 40, height: 40, strokeWidth: 3, fontSize: 'text-xs' },
    md: { width: 60, height: 60, strokeWidth: 4, fontSize: 'text-sm' },
    lg: { width: 80, height: 80, strokeWidth: 5, fontSize: 'text-base' }
  };
  
  const currentSize = sizes[size];
  const radius = (currentSize.width - currentSize.strokeWidth * 2) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const colors = {
    blue: 'stroke-blue-500',
    purple: 'stroke-purple-500',
    green: 'stroke-green-500',
    orange: 'stroke-orange-500',
    pink: 'stroke-pink-500'
  };

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg
        width={currentSize.width}
        height={currentSize.height}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={currentSize.width / 2}
          cy={currentSize.height / 2}
          r={radius}
          stroke="rgb(51 65 85)" // slate-600
          strokeWidth={currentSize.strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={currentSize.width / 2}
          cy={currentSize.height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={currentSize.strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={cn(colors[color as keyof typeof colors] || colors.blue)}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children || (showText && (
          <span className={cn("font-medium text-slate-300", currentSize.fontSize)}>
            {Math.round(progress)}%
          </span>
        ))}
      </div>
      
      {/* Glow effect for high progress */}
      {progress > 75 && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, transparent 40%, ${
              color === 'blue' ? 'rgba(59, 130, 246, 0.2)' :
              color === 'purple' ? 'rgba(147, 51, 234, 0.2)' :
              color === 'green' ? 'rgba(34, 197, 94, 0.2)' :
              color === 'orange' ? 'rgba(249, 115, 22, 0.2)' :
              'rgba(236, 72, 153, 0.2)'
            } 70%, transparent)`
          }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </div>
  );
};