'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthForm } from '@/components/auth/AuthForm';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');

  const handleAuthSubmit = (data: any) => {
    console.log('Registration submitted:', data);
    // Here you would typically call your registration API
    
    // For demo purposes, redirect to dashboard
    router.push('/');
  };

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    console.log('Role selected:', role);
  };

  return (
    <main className="relative min-h-screen bg-slate-900 overflow-hidden flex items-center justify-center">
      {/* Background with floating particles */}
      <div className="absolute inset-0">
        {/* Gradient background with different colors for register */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/10 to-pink-900/10" />
        
        {/* Animated background particles */}
        {Array.from({ length: 60 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -40, 0],
              opacity: [0.2, 0.9, 0.2],
              scale: [1, 1.8, 1]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Larger floating orbs with register theme */}
        {Array.from({ length: 10 }).map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full blur-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${60 + Math.random() * 120}px`,
              height: `${60 + Math.random() * 120}px`,
              background: `radial-gradient(circle, ${
                i % 4 === 0 ? 'rgba(147, 51, 234, 0.12)' :
                i % 4 === 1 ? 'rgba(236, 72, 153, 0.12)' :
                i % 4 === 2 ? 'rgba(59, 130, 246, 0.12)' :
                'rgba(34, 197, 94, 0.12)'
              } 0%, transparent 70%)`
            }}
            animate={{
              x: [0, 120, 0],
              y: [0, -120, 0],
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.7, 0.3]
            }}
            transition={{
              duration: 18 + Math.random() * 12,
              repeat: Infinity,
              delay: Math.random() * 6,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <AuthForm
            mode={authMode}
            onModeChange={setAuthMode}
            onRoleSelect={handleRoleSelect}
            onSubmit={handleAuthSubmit}
          />
        </motion.div>
      </div>

      {/* Bottom navigation hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.5 }}
      >
        <p className="text-slate-500 text-sm">
          Join thousands of learners worldwide
        </p>
      </motion.div>

      {/* Decorative elements with register theme */}
      <div className="absolute top-8 left-8">
        <motion.div
          className="w-18 h-18 rounded-full bg-gradient-to-br from-purple-500/25 to-pink-500/25 backdrop-blur-sm border border-slate-700/50"
          animate={{
            rotate: 360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 22, repeat: Infinity, ease: "linear" },
            scale: { duration: 4.5, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </div>

      <div className="absolute top-1/4 right-8">
        <motion.div
          className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500/25 to-blue-500/25 backdrop-blur-sm border border-slate-700/50"
          animate={{
            rotate: -360,
            scale: [1, 1.3, 1]
          }}
          transition={{
            rotate: { duration: 18, repeat: Infinity, ease: "linear" },
            scale: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }
          }}
        />
      </div>

      <div className="absolute bottom-1/4 left-8">
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/25 to-emerald-500/25 backdrop-blur-sm border border-slate-700/50"
          animate={{
            rotate: 360,
            scale: [1, 1.25, 1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }
          }}
        />
      </div>

      <div className="absolute bottom-8 right-8">
        <motion.div
          className="w-22 h-22 rounded-full bg-gradient-to-br from-orange-500/25 to-red-500/25 backdrop-blur-sm border border-slate-700/50"
          animate={{
            rotate: -360,
            scale: [1, 1.18, 1]
          }}
          transition={{
            rotate: { duration: 28, repeat: Infinity, ease: "linear" },
            scale: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 3 }
          }}
        />
      </div>

      {/* Success celebration particles (hidden by default) */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={`celebration-${i}`}
            className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              y: [0, -100],
              x: [0, (Math.random() - 0.5) * 200]
            }}
            transition={{
              duration: 2,
              delay: i * 0.1,
              ease: "easeOut"
            }}
          />
        ))}
      </div>
    </main>
  );
}