'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface GlassButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const GlassButton = ({
  children, className, variant = 'primary', size = 'md', loading = false, icon, ...props
}: GlassButtonProps) => {
  const variantStyles: Record<string, React.CSSProperties> = {
    primary:   { background: 'var(--accent-gradient)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow-sm)' },
    secondary: { background: 'var(--surface)',         color: 'var(--text-primary)',         border: '1.5px solid var(--border-medium)', boxShadow: 'var(--shadow-soft)' },
    ghost:     { background: 'transparent',            color: 'var(--text-secondary)' },
    danger:    { background: 'var(--destructive-bg)',  color: 'var(--destructive)',           border: '1.5px solid var(--destructive-bg)' },
  };

  const sizes = {
    sm:   'px-4 py-2 text-xs rounded-xl h-9',
    md:   'px-5 py-2.5 text-sm rounded-xl h-10 font-semibold',
    lg:   'px-7 py-3 text-sm rounded-xl h-11 font-bold',
    icon: 'p-2 rounded-xl h-9 w-9 flex items-center justify-center',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ opacity: 0.9 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none',
        sizes[size],
        className
      )}
      style={variantStyles[variant]}
      {...props}
    >
      {loading ? <Loader2 size={14} className="spin-slow" /> : icon ? <span className="flex items-center">{icon}</span> : null}
      {children}
    </motion.button>
  );
};
