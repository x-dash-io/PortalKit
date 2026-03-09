'use client';

import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PortalLayoutProps {
  children: React.ReactNode;
  freelancerName: string;
  projectTitle: string;
  theme?: string;
}

export function PortalLayout({ children, freelancerName, projectTitle, theme = 'frost' }: PortalLayoutProps) {
  return (
    <div className={cn('min-h-screen transition-colors duration-500', theme)} data-theme={theme}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,var(--canvas-accent),transparent_26%)]" />

      <header className="sticky top-0 z-50 border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-elevated)_88%,transparent)] backdrop-blur-xl">
        <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-[var(--glow)]">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-[var(--text-primary)]">{projectTitle}</h1>
              <p className="mt-1 text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">
                Client portal for {freelancerName}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-2 rounded-full border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-[var(--text-secondary)] md:flex">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Secure access
          </div>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-12">{children}</main>

      <footer className="border-t border-[var(--border-subtle)] py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-[var(--text-secondary)] md:flex-row">
          <p>&copy; {new Date().getFullYear()} {freelancerName}. All rights reserved.</p>
          <p className="font-medium text-[var(--text-muted)]">Powered by PortalKit</p>
        </div>
      </footer>
    </div>
  );
}
