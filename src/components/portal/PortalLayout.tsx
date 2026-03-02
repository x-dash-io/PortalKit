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
        <div className={cn("min-h-screen transition-colors duration-500", theme)} data-theme={theme}>
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.05),transparent_50%)] pointer-events-none" />

            <header className="sticky top-0 z-50 glass-nav border-b border-white/5 px-6 h-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                        <ShieldCheck size={24} />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-none">{projectTitle}</h1>
                        <p className="text-xs text-[var(--text-muted)] mt-1">Client Portal • <span className="text-indigo-400 font-medium">{freelancerName}</span></p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Secure Access
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12 relative">
                {children}
            </main>

            <footer className="border-t border-white/5 py-12 px-6">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-[var(--text-muted)]">
                        &copy; {new Date().getFullYear()} {freelancerName}. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-muted)] group cursor-default">
                        Powered by
                        <span className="text-[var(--text-primary)] group-hover:text-indigo-400 transition-colors font-bold tracking-tight">PortalKit</span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
