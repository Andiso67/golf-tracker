'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';

export default function LangUpdater() {
  const language = useStore((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return null;
}
