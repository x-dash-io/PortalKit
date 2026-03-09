'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const GlassCard = ({ children, className, hoverable = true, ...props }: GlassCardProps) => (
  <motion.div
    whileHover={hoverable ? { y: -2, boxShadow: 'var(--shadow-hover)' } : {}}
    transition={{ duration: 0.18, ease: 'easeOut' }}
    className={cn('glass-card rounded-2xl', className)}
    {...props}
  >
    {children}
  </motion.div>
);
