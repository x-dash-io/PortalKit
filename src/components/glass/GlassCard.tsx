'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
}

export const GlassCard = ({ children, className, hoverable = true, style, ...props }: GlassCardProps) => (
  <div
    className={cn('rounded-2xl transition-all duration-200', hoverable && 'hover:-translate-y-[2px]', className)}
    style={{
      background: 'var(--surface)',
      border: '1px solid var(--border-subtle)',
      boxShadow: 'var(--shadow-card)',
      ...style,
    }}
    {...(hoverable ? {
      onMouseEnter: (e: React.MouseEvent<HTMLDivElement>) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-hover)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-medium)';
      },
      onMouseLeave: (e: React.MouseEvent<HTMLDivElement>) => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = 'var(--shadow-card)';
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-subtle)';
      },
    } : {})}
    {...props}
  >
    {children}
  </div>
);
