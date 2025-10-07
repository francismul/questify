import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Animation utilities
export const animations = {
  // Floating elements
  float: {
    y: [-5, 5, -5],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  
  // Glow effects
  glow: {
    boxShadow: [
      "0 0 20px rgba(99, 102, 241, 0.3)",
      "0 0 40px rgba(99, 102, 241, 0.6)",
      "0 0 20px rgba(99, 102, 241, 0.3)"
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  },
  
  // Radial menu expansion
  radialExpand: {
    scale: [0, 1],
    opacity: [0, 1],
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  
  // Card orbital animation
  orbital: (radius: number, speed: number = 1) => ({
    x: [0, radius, 0, -radius, 0],
    y: [radius, 0, -radius, 0, radius],
    transition: {
      duration: 10 / speed,
      repeat: Infinity,
      ease: "linear"
    }
  }),
  
  // Course node pulse
  nodePulse: {
    scale: [1, 1.1, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

// Color utilities for courses
export const courseColors = [
  { name: 'cosmic-blue', gradient: 'from-blue-500 to-purple-600', glow: 'rgba(99, 102, 241, 0.6)' },
  { name: 'stellar-pink', gradient: 'from-pink-500 to-rose-600', glow: 'rgba(236, 72, 153, 0.6)' },
  { name: 'nebula-green', gradient: 'from-green-500 to-emerald-600', glow: 'rgba(34, 197, 94, 0.6)' },
  { name: 'solar-orange', gradient: 'from-orange-500 to-amber-600', glow: 'rgba(249, 115, 22, 0.6)' },
  { name: 'galaxy-purple', gradient: 'from-purple-500 to-indigo-600', glow: 'rgba(147, 51, 234, 0.6)' },
  { name: 'meteor-red', gradient: 'from-red-500 to-pink-600', glow: 'rgba(239, 68, 68, 0.6)' },
  { name: 'aurora-cyan', gradient: 'from-cyan-500 to-blue-600', glow: 'rgba(6, 182, 212, 0.6)' },
  { name: 'comet-yellow', gradient: 'from-yellow-500 to-orange-600', glow: 'rgba(234, 179, 8, 0.6)' }
];

// Progress calculation utilities
export function calculateCourseProgress(completedChapters: string[], totalChapters: number): number {
  return Math.round((completedChapters.length / totalChapters) * 100);
}

export function calculateXPFromScore(score: number, maxScore: number): number {
  const percentage = (score / maxScore) * 100;
  return Math.round(percentage * 10); // 100% = 1000 XP
}

export function getLevelFromXP(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

export function getXPToNextLevel(xp: number): number {
  const currentLevel = getLevelFromXP(xp);
  const nextLevelXP = currentLevel * 1000;
  return nextLevelXP - xp;
}

// Timeline position utilities
export function calculateTimelinePosition(index: number, total: number): { x: number; y: number } {
  const spacing = 300; // pixels between nodes
  const x = index * spacing;
  const y = Math.sin(index * 0.5) * 50; // Creates a gentle wave pattern
  return { x, y };
}

// Background gradient utilities
export function getBackgroundGradientForCourse(courseColor: string): string {
  const colorMap: Record<string, string> = {
    'cosmic-blue': 'bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900',
    'stellar-pink': 'bg-gradient-to-br from-slate-900 via-pink-900/20 to-slate-900',
    'nebula-green': 'bg-gradient-to-br from-slate-900 via-green-900/20 to-slate-900',
    'solar-orange': 'bg-gradient-to-br from-slate-900 via-orange-900/20 to-slate-900',
    'galaxy-purple': 'bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900',
    'meteor-red': 'bg-gradient-to-br from-slate-900 via-red-900/20 to-slate-900',
    'aurora-cyan': 'bg-gradient-to-br from-slate-900 via-cyan-900/20 to-slate-900',
    'comet-yellow': 'bg-gradient-to-br from-slate-900 via-yellow-900/20 to-slate-900'
  };
  
  return colorMap[courseColor] || 'bg-gradient-to-br from-slate-900 to-slate-800';
}

// Validation utilities
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    return { valid: false, message: 'Password must contain uppercase, lowercase, and numbers' };
  }
  return { valid: true, message: '' };
}

// Time formatting utilities
export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours === 0) {
    return `${remainingMinutes}m`;
  }
  
  return remainingMinutes === 0 ? `${hours}h` : `${hours}h ${remainingMinutes}m`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}