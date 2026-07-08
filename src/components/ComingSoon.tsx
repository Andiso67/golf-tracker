'use client';

import { Flag } from 'lucide-react';
import { useTranslation } from '@/i18n/useTranslation';

interface ComingSoonProps {
  title: string;
}

export default function ComingSoon({ title }: ComingSoonProps) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4">
      <div className="relative">
        <Flag size={80} className="text-ft-green-bright/30" />
        <div className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-ft-green-bright text-[10px] font-bold text-white">
          ?
        </div>
      </div>
      <h1 className="text-center text-2xl font-bold tracking-tight">
        {title}
      </h1>
      <div className="rounded-2xl border border-dashed border-ft-border bg-ft-surface/50 px-8 py-4">
        <p className="text-center text-sm font-semibold uppercase tracking-widest text-ft-label">
          {t('comingSoon')}
        </p>
      </div>
    </div>
  );
}
