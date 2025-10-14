"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface MetricCardProps {
  title: string
  value: string | number
  subtitle: string
  color: "red" | "green" | "blue" | "purple" | "yellow" | "cyan"
  percentage: number
  className?: string
}

export function MetricCard({
  title,
  value,
  subtitle,
  color,
  percentage,
  className,
}: MetricCardProps) {
  // Color mappings for the circular gauge
  const colorClasses = {
    red: "text-metric-red",
    green: "text-metric-green",
    blue: "text-metric-blue",
    purple: "text-metric-purple",
    yellow: "text-metric-yellow",
    cyan: "text-metric-cyan",
  }

  const strokeColors = {
    red: "#ef4444",
    green: "#10b981",
    blue: "#3b82f6",
    purple: "#a855f7",
    yellow: "#fbbf24",
    cyan: "#06b6d4",
  }

  // Circle properties
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
      className={cn(
        "bg-card rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow",
        className
      )}
    >
      <div className="flex flex-col items-center">
        {/* Circular Gauge */}
        <div className="relative w-24 h-24 mb-4">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="48"
              cy="48"
              r={radius}
              stroke="#e5e7eb"
              strokeWidth="8"
              fill="none"
            />
            {/* Progress circle */}
            <motion.circle
              cx="48"
              cy="48"
              r={radius}
              stroke={strokeColors[color]}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, ease: "easeInOut" }}
              strokeDasharray={circumference}
            />
          </svg>
          
          {/* Center value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-2xl font-bold", colorClasses[color])}>
              {value}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-foreground text-center mb-1">
          {title}
        </h3>

        {/* Subtitle */}
        <p className="text-xs text-muted-foreground text-center mb-2">
          {subtitle}
        </p>

        {/* Percentage */}
        <div className="text-xs font-medium text-muted-foreground">
          {percentage}%
        </div>
      </div>
    </motion.div>
  )
}
