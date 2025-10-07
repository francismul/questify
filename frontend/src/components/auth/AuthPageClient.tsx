'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { AuthLoadingSkeleton, AuthFormFallback } from '@/components/auth/AuthLoadingSkeleton';

// Dynamically import the AuthForm with no SSR to avoid hydration issues
const DynamicAuthForm = dynamic(
  () => import('@/components/auth/AuthForm').then((mod) => ({ default: mod.AuthForm })),
  {
    ssr: false, // Disable server-side rendering for this component
    loading: () => <AuthFormFallback />,
  }
);

interface AuthPageClientProps {
  mode: 'login' | 'register';
}

export function AuthPageClient({ mode }: AuthPageClientProps) {
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(mode);
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher' | null>(null);

  const handleModeChange = (newMode: 'login' | 'register') => {
    setCurrentMode(newMode);
    setSelectedRole(null);
  };

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    setSelectedRole(role);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900/20 to-purple-900/20">
        <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      </div>

      {/* Content */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        <AuthErrorBoundary>
          <Suspense fallback={<AuthLoadingSkeleton />}>
            <DynamicAuthForm
              mode={currentMode}
              onModeChange={handleModeChange}
              onRoleSelect={handleRoleSelect}
            />
          </Suspense>
        </AuthErrorBoundary>
      </div>

      {/* Footer */}
      <footer className="relative text-center p-6 text-slate-400 text-sm">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => handleModeChange(currentMode === 'login' ? 'register' : 'login')}
            className="hover:text-white transition-colors"
          >
            {currentMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
          <span>•</span>
          <a href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </a>
          <span>•</span>
          <a href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </a>
        </div>
      </footer>
    </div>
  );
}