'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  color?: 'emerald' | 'amber' | 'blue' | 'rose' | 'violet' | 'cyan';
}

const colorMap = {
  emerald: 'text-ft-green-bright',
  amber: 'text-ft-amber',
  blue: 'text-ft-blue',
  rose: 'text-ft-rose',
  violet: 'text-ft-violet',
  cyan: 'text-ft-green-bright',
};

export default function StatsCard({
  label,
  value,
  sublabel,
  icon: Icon,
  color = 'emerald',
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 rounded-xl border border-ft-border bg-ft-card p-3"
    >
      <div className={`shrink-0 ${colorMap[color]}`}>
        <Icon size={24} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-ft-label">{label}</p>
        <p className={`text-lg font-bold leading-tight tracking-tight ${colorMap[color]}`}>
          {value}
        </p>
        {sublabel && (
          <p className="text-[11px] text-ft-muted">{sublabel}</p>
        )}
      </div>
    </motion.div>
  );
}
