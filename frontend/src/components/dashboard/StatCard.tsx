'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  color: 'red' | 'green' | 'blue' | 'purple' | 'yellow' | 'cyan';
  percentage?: number;
  maxValue?: number;
}

const colorMap = {
  red: {
    gradient: 'from-red-500 to-pink-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
    ring: 'ring-red-500/30',
  },
  green: {
    gradient: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-600 dark:text-green-400',
    ring: 'ring-green-500/30',
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
    ring: 'ring-blue-500/30',
  },
  purple: {
    gradient: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-600 dark:text-purple-400',
    ring: 'ring-purple-500/30',
  },
  yellow: {
    gradient: 'from-yellow-500 to-orange-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-600 dark:text-yellow-400',
    ring: 'ring-yellow-500/30',
  },
  cyan: {
    gradient: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50 dark:bg-cyan-900/20',
    text: 'text-cyan-600 dark:text-cyan-400',
    ring: 'ring-cyan-500/30',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color,
  percentage = 0,
  maxValue = 100,
}) => {
  const colors = colorMap[color];
  const displayPercentage = percentage || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-slate-200 dark:border-slate-700`}
    >
      <div className="flex flex-col">
        {/* Title */}
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-4">
          {title}
        </h3>

        {/* Value and Gauge */}
        <div className="flex items-center justify-between mb-4">
          {/* Circular Gauge */}
          <div className="relative w-24 h-24">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-200 dark:text-slate-700"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="url(#gradient-{color})"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${(displayPercentage / 100) * 251.2} 251.2`}
                className="transition-all duration-1000"
              />
              {/* Gradient definition */}
              <defs>
                <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" className={colors.text} />
                  <stop offset="100%" className={colors.text} style={{ stopOpacity: 0.6 }} />
                </linearGradient>
              </defs>
            </svg>
            {/* Center value */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${colors.text}`}>
                {value}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="flex-1 ml-4">
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                {subtitle}
              </p>
            )}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${colors.gradient}`}></div>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {displayPercentage}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
