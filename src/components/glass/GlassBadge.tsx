import React from 'react';
import { cn } from '@/lib/utils';

interface GlassBadgeProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'indigo' | 'emerald' | 'amber' | 'red' | 'slate';
}

export const GlassBadge = ({ children, className, variant = 'indigo' }: GlassBadgeProps) => {
    const variants = {
        indigo: 'bg-[var(--accent-light)] text-[var(--accent)] border-[var(--accent)]/15',
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        amber: 'bg-amber-50 text-amber-700 border-amber-100',
        red: 'bg-red-50 text-red-700 border-red-100',
        slate: 'bg-slate-100 text-slate-700 border-slate-200',
    };

    return (
        <span className={cn(
            'px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border',
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};
