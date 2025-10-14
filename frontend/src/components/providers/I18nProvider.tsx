'use client';

import { ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import '@/lib/i18n'; // Initialize i18n

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Ensure i18n is initialized on client side
    if (!i18n.isInitialized) {
      i18n.init();
    }
  }, [i18n]);

  return <>{children}</>;
}