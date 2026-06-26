'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Plus, BarChart3, MapPin, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';

const navLinks = [
  { href: '/', icon: Home, key: 'nav.home' },
  { href: '/new-round', icon: Plus, key: 'nav.new' },
  { href: '/courses', icon: MapPin, key: 'nav.courses' },
  { href: '/dashboard', icon: BarChart3, key: 'nav.stats' },
  { href: '/profile', icon: User, key: 'nav.profile' },
];

function NavContent() {
  const pathname = usePathname();
  const { t } = useTranslation();

  return (
    <>
      {navLinks.map(({ href, icon: Icon, key }) => {
        const isActive =
          pathname === href ||
          (href !== '/' && pathname?.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className="relative flex flex-col items-center gap-0.5 px-2 py-1"
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute -top-2 h-1 w-6 rounded-full bg-emerald-500"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <Icon
              size={20}
              className={
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-400 dark:text-zinc-500'
              }
            />
            <span
              className={`text-[9px] font-medium ${
                isActive
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-zinc-400 dark:text-zinc-500'
              }`}
            >
              {t(key)}
            </span>
          </Link>
        );
      })}
    </>
  );
}

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-200 bg-white/80 px-1 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="mx-auto flex max-w-lg items-center justify-around py-1.5">
        <Suspense fallback={null}>
          <NavContent />
        </Suspense>
      </div>
    </nav>
  );
}
