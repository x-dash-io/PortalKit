'use client';

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassCardProps extends HTMLMotionProps<'div'> {
    children: React.ReactNode;
    className?: string;
    hoverable?: boolean;
}

export const GlassCard = ({ children, className, hoverable = true, ...props }: GlassCardProps) => {
    return (
        <motion.div
            whileHover={hoverable ? { y: -4, backgroundColor: 'var(--bg-glass-hover)', boxShadow: 'var(--shadow-hover)' } : {}}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={cn(
                'glass-card rounded-3xl p-6 transition-colors duration-300',
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};
