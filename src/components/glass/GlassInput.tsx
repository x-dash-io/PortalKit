'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
  error?: string;
  label?: string;
}

export const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, icon, suffix, error, label, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-[10px] font-bold uppercase tracking-widest"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-xl px-3.5 py-2.5 text-sm outline-none transition-all duration-150',
              icon && 'pl-9',
              suffix && 'pr-9',
              className,
            )}
            style={{
              background: 'var(--input)',
              border: `1px solid ${error ? 'var(--destructive)' : 'var(--border-medium)'}`,
              color: 'var(--text-primary)',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = error ? 'var(--destructive)' : 'var(--accent)';
              e.currentTarget.style.boxShadow = error ? '0 0 0 3px var(--destructive-bg)' : 'var(--glow-accent)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = error ? 'var(--destructive)' : 'var(--border-medium)';
              e.currentTarget.style.boxShadow = 'none';
            }}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              {suffix}
            </span>
          )}
        </div>
        {error && (
          <p className="text-xs font-medium" style={{ color: 'var(--destructive)' }}>{error}</p>
        )}
      </div>
    );
  },
);

GlassInput.displayName = 'GlassInput';
