'use client';

import { useStore } from '@/store/useStore';
import { getTranslation, translate } from './index';

export function useTranslation() {
  const language = useStore((s) => s.language);
  const dict = getTranslation(language);

  const t = (key: string, params?: Record<string, string | number>) =>
    translate(dict, key, params);

  return { t, language, dir: 'ltr' as const };
}
