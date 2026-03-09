'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const GlassInput = ({ icon, className, ...props }: GlassInputProps) => (
  <div className="relative">
    {icon && (
      <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
        {icon}
      </div>
    )}
    <input
      className={cn('input-base w-full h-10 text-sm px-3 py-2', icon && 'pl-9', className)}
      {...props}
    />
  </div>
);
