'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Edit3, ChartBar, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/i18n/useTranslation';
import { lightTap } from '@/lib/haptics';

const navLinks = [
  { href: '/', icon: LayoutDashboard, key: 'nav.home' },
  { href: '/new-round', icon: Edit3, key: 'nav.new' },
  { href: '/dashboard', icon: ChartBar, key: 'nav.stats' },
  { href: '/players', icon: User, key: 'nav.profile' },
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
            onClick={lightTap}
            className="relative flex min-h-[44px] flex-col items-center justify-center gap-0.5 px-3 transition-all active:scale-90"
          >
            {isActive && (
              <motion.div
                layoutId="nav-pill"
                className="absolute -top-1 h-0.5 w-5 rounded-full bg-ft-green-bright"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <Icon
              size={20}
              className={
                isActive
                  ? 'text-ft-green-bright'
                  : 'text-ft-label'
              }
            />
            <span
              className={`text-[9px] font-medium ${
                isActive
                  ? 'text-ft-green-bright'
                  : 'text-ft-label'
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-ft-border bg-ft-surface/80 backdrop-blur-xl"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="mx-auto flex max-w-lg items-center justify-around py-1">
        <Suspense fallback={null}>
          <NavContent />
        </Suspense>
      </div>
    </nav>
  );
}
