'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon: LucideIcon;
  color?: 'green' | 'amber' | 'blue' | 'rose' | 'violet' | 'cyan';
}

const colorMap = {
  green: 'border-ft-green/30 bg-ft-green/10',
  amber: 'border-ft-amber/30 bg-ft-amber/10',
  blue: 'border-ft-blue/30 bg-ft-blue/10',
  rose: 'border-ft-rose/30 bg-ft-rose/10',
  violet: 'border-ft-violet/30 bg-ft-violet/10',
  cyan: 'border-ft-blue/30 bg-ft-blue/10',
};

const iconColorMap = {
  green: 'text-ft-green-bright',
  amber: 'text-ft-amber',
  blue: 'text-ft-blue',
  rose: 'text-ft-rose',
  violet: 'text-ft-violet',
  cyan: 'text-ft-blue',
};

export default function StatsCard({
  label,
  value,
  sublabel,
  icon: Icon,
  color = 'green',
}: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-3 rounded-xl border p-3 ${colorMap[color]}`}
    >
      <div className={`shrink-0 ${iconColorMap[color]}`}>
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
