'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import NewRoundForm from '@/components/NewRoundForm';
import BottomNav from '@/components/BottomNav';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useTranslation } from '@/i18n/useTranslation';

function NewRoundContent() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pt-[calc(env(safe-area-inset-top,0px)+1.5rem)]">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-6"
      >
        <Link
          href="/"
          className="mb-3 inline-flex items-center gap-1 text-sm text-ft-muted"
        >
          <ArrowLeft size={16} />
          {t('newRound.back')}
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {t('newRound.title')}
        </h1>
        <p className="text-sm text-ft-muted">{t('newRound.subtitle')}</p>
      </motion.div>
      <NewRoundForm />
    </div>
  );
}

export default function NewRoundPage() {
  return (
    <>
      <ErrorBoundary
        fallback={
          <div className="mx-auto flex max-w-lg flex-1 flex-col items-center justify-center p-8 text-center">
            <p className="text-ft-muted">Something went wrong</p>
            <Link href="/" className="mt-2 text-sm font-medium text-ft-green-bright">
              Go home
            </Link>
          </div>
        }
      >
        <Suspense
          fallback={
            <div className="mx-auto flex max-w-lg flex-1 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-ft-green-bright border-t-transparent" />
            </div>
          }
        >
          <NewRoundContent />
        </Suspense>
      </ErrorBoundary>
      <BottomNav />
    </>
  );
}
