'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AuthForm } from '@/components/auth/AuthForm';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  const handleAuthSubmit = (data: any) => {
    console.log('Auth submitted:', data);
    // Here you would typically call your authentication API
    
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
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-900/10 to-purple-900/10" />
        
        {/* Animated background particles */}
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-400/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Larger floating orbs */}
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={`orb-${i}`}
            className="absolute rounded-full blur-xl"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${50 + Math.random() * 100}px`,
              height: `${50 + Math.random() * 100}px`,
              background: `radial-gradient(circle, ${
                i % 3 === 0 ? 'rgba(59, 130, 246, 0.1)' :
                i % 3 === 1 ? 'rgba(147, 51, 234, 0.1)' :
                'rgba(236, 72, 153, 0.1)'
              } 0%, transparent 70%)`
            }}
            animate={{
              x: [0, 100, 0],
              y: [0, -100, 0],
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
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
          Experience the future of learning
        </p>
      </motion.div>

      {/* Decorative elements */}
      <div className="absolute top-8 left-8">
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-slate-700/50"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 20, repeat: Infinity, ease: "linear" },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
        />
      </div>

      <div className="absolute top-8 right-8">
        <motion.div
          className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500/20 to-orange-500/20 backdrop-blur-sm border border-slate-700/50"
          animate={{
            rotate: -360,
            scale: [1, 1.2, 1]
          }}
          transition={{
            rotate: { duration: 15, repeat: Infinity, ease: "linear" },
            scale: { duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1 }
          }}
        />
      </div>

      <div className="absolute bottom-8 right-8">
        <motion.div
          className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500/20 to-cyan-500/20 backdrop-blur-sm border border-slate-700/50"
          animate={{
            rotate: 360,
            scale: [1, 1.15, 1]
          }}
          transition={{
            rotate: { duration: 25, repeat: Infinity, ease: "linear" },
            scale: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }
          }}
        />
      </div>
    </main>
  );
}