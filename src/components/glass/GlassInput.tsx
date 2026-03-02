'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: React.ReactNode;
}

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
    ({ className, label, error, icon, ...props }, ref) => {
        return (
            <div className="space-y-1.5 w-full">
                {label && (
                    <label className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    {icon && (
                        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors">
                            {icon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            'w-full h-12 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl px-4 text-sm transition-all outline-none',
                            'focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-light)]',
                            'placeholder:text-[var(--text-muted)]',
                            icon && 'pl-11',
                            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/10',
                            className
                        )}
                        {...props}
                    />
                </div>
                {error && <p className="text-[10px] text-red-500 font-medium ml-1">{error}</p>}
            </div>
        );
    }
);

GlassInput.displayName = 'GlassInput';
