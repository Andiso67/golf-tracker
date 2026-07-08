'use client';

import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ComingSoon from '@/components/ComingSoon';
import { useTranslation } from '@/i18n/useTranslation';

export default function ArbitroVirtualPage() {
  const { t } = useTranslation();
  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)] pb-24">
      <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400">
        <ArrowLeft size={16} />
        {t('newRound.back')}
      </Link>
      <ComingSoon title={t('nav.virtualReferee')} />
    </div>
  );
}
