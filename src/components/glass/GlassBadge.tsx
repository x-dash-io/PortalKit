import React from 'react';
import { cn } from '@/lib/utils';

interface GlassBadgeProps {
    children: React.ReactNode;
    className?: string;
    variant?: 'indigo' | 'emerald' | 'amber' | 'red' | 'slate';
}

export const GlassBadge = ({ children, className, variant = 'indigo' }: GlassBadgeProps) => {
    const variants = {
        indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
        emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        red: 'bg-red-500/10 text-red-500 border-red-500/20',
        slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
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
