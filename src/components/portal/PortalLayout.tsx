'use client';

import React from 'react';
import { ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortalLayoutProps {
  children: React.ReactNode;
  freelancerName: string;
  projectTitle: string;
  theme?: string;
}

export function PortalLayout({ children, freelancerName, projectTitle, theme = 'frost' }: PortalLayoutProps) {
  return (
    <div className={cn('min-h-screen', theme)} data-theme={theme}>
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-32 right-0 h-80 w-80 rounded-full"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.16 }}
        />
        <div
          className="absolute bottom-0 left-0 h-64 w-64 rounded-full"
          style={{ background: 'radial-gradient(circle, var(--accent-3) 0%, transparent 70%)', filter: 'blur(60px)', opacity: 0.08 }}
        />
      </div>

      {/* Header */}
      <header
        className="sticky top-0 z-50"
        style={{
          background: 'var(--nav-bg)',
          borderBottom: '1px solid var(--nav-border)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-3">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl text-white"
              style={{ background: 'var(--accent-gradient)', boxShadow: 'var(--glow-sm)' }}
            >
              <Zap size={14} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
                {projectTitle}
              </h1>
              <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                by {freelancerName}
              </p>
            </div>
          </div>

          <div
            className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider md:flex"
            style={{ background: 'var(--status-active-bg)', color: 'var(--status-active)', border: '1px solid transparent' }}
          >
            <ShieldCheck size={11} />
            Secure access
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="relative mx-auto max-w-5xl px-5 py-8">{children}</main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)' }} className="py-6">
        <div
          className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-5 text-xs md:flex-row"
          style={{ color: 'var(--text-muted)' }}
        >
          <p>&copy; {new Date().getFullYear()} {freelancerName}. All rights reserved.</p>
          <p className="font-semibold" style={{ color: 'var(--accent)' }}>Powered by PortalKit</p>
        </div>
      </footer>
    </div>
  );
}
