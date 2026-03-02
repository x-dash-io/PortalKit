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
    theme?: string;
}

export const GlassButton = ({
    children,
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    theme,
    ...props
}: GlassButtonProps) => {
    const variants: Record<string, string> = {
        primary: 'bg-[var(--accent)] text-white shadow-[var(--glow)] hover:opacity-90',
        secondary: 'glass-card border-white/5 bg-[var(--bg-glass)] text-[var(--text-primary)] hover:bg-[var(--bg-glass-hover)]',
        ghost: 'bg-transparent text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]',
        danger: 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white',
    };

    const sizes = {
        sm: 'px-4 py-2 text-xs rounded-xl h-9',
        md: 'px-6 py-3 text-sm rounded-2xl h-11 font-bold',
        lg: 'px-8 py-4 text-base rounded-2xl h-14 font-black tracking-tight',
        icon: 'p-2 rounded-xl h-10 w-10 flex items-center justify-center',
    };

    return (
        <motion.button
            whileTap={{ scale: 0.96 }}
            whileHover={{ scale: 1.02 }}
            className={cn(
                'inline-flex items-center justify-center transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : icon ? (
                <span className="mr-2 flex items-center justify-center">{icon as any}</span>
            ) : null}
            {children as any}
        </motion.button>
    );
};
