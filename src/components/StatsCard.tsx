'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  iconColor?: string;
}

export default function StatsCard({
  label,
  value,
  sublabel,
  icon: Icon,
  iconColor,
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl border border-ft-border bg-ft-card p-3"
    >
      <div className={`shrink-0 ${iconColor || 'text-ft-label'}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wider text-ft-label">
          {label}
        </p>
        <p className="font-mono text-lg font-bold leading-tight tracking-tight text-ft-text">
          {value}
        </p>
        {sublabel && (
          <p className="text-[11px] text-ft-muted">{sublabel}</p>
        )}
      </div>
    </motion.div>
  );
}
