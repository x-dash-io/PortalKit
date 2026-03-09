import React from 'react';
import { cn } from '@/lib/utils';

interface GlassBadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'indigo' | 'emerald' | 'amber' | 'red' | 'slate';
}

const styles: Record<string, React.CSSProperties> = {
  indigo:  { background: 'var(--accent-light)',      color: 'var(--accent)' },
  emerald: { background: 'var(--status-active-bg)',  color: 'var(--status-active)' },
  amber:   { background: 'var(--status-pending-bg)', color: 'var(--status-pending)' },
  red:     { background: 'var(--destructive-bg)',    color: 'var(--destructive)' },
  slate:   { background: 'var(--status-archived-bg)',color: 'var(--status-archived)' },
};

export const GlassBadge = ({ children, className, variant = 'indigo' }: GlassBadgeProps) => (
  <span className={cn('status-badge', className)} style={styles[variant]}>
    {children}
  </span>
);
