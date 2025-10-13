'use client';

import { useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';
import { AuthLoadingSkeleton, AuthFormFallback } from '@/components/auth/AuthLoadingSkeleton';

// Dynamically import the ModernAuthForm with no SSR
const DynamicAuthForm = dynamic(
  () => import('@/components/auth/ModernAuthForm').then((mod) => ({ default: mod.ModernAuthForm })),
  {
    ssr: false,
    loading: () => <AuthFormFallback />,
  }
);

interface AuthPageClientProps {
  mode: 'login' | 'register';
}

export function AuthPageClient({ mode }: AuthPageClientProps) {
  const [currentMode, setCurrentMode] = useState<'login' | 'register'>(mode);

  const handleModeChange = (newMode: 'login' | 'register') => {
    setCurrentMode(newMode);
  };

  return (
    <AuthErrorBoundary>
      <Suspense fallback={<AuthLoadingSkeleton />}>
        <DynamicAuthForm
          mode={currentMode}
          onModeChange={handleModeChange}
        />
      </Suspense>
    </AuthErrorBoundary>
  );
}