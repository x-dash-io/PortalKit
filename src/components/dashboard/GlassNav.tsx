'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban, LayoutDashboard, PanelLeftClose,
  PanelLeftOpen, Settings, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';
import { ThemeSwitcher } from '@/components/themes/ThemeSwitcher';

const navItems = [
  { name: 'Dashboard', href: '/dashboard',          icon: LayoutDashboard, exact: true },
  { name: 'Projects',  href: '/dashboard/projects', icon: FolderKanban,    exact: false },
  { name: 'Settings',  href: '/dashboard/settings', icon: Settings,        exact: false },
];

export function GlassNav() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
        className="fixed left-0 top-0 z-50 hidden h-screen flex-col md:flex overflow-hidden"
        style={{
          background: 'var(--nav-bg)',
          borderRight: '1px solid var(--nav-border)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        {/* Logo */}
        <div className="flex h-[60px] items-center gap-3 px-4 shrink-0">
          <Link href="/dashboard" className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-white"
              style={{ background: 'var(--accent-gradient)', boxShadow: 'var(--glow-sm)', flexShrink: 0 }}
            >
              <Zap size={15} strokeWidth={2.5} />
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={{ duration: 0.16 }}
                  className="min-w-0 flex-1"
                >
                  <p className="text-sm font-black tracking-tight truncate" style={{ color: 'var(--text-primary)' }}>
                    PortalKit
                  </p>
                  <p className="text-[10px] font-medium truncate" style={{ color: 'var(--text-muted)' }}>
                    Client workspace
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </Link>

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-[var(--nav-item-hover)]"
            style={{ color: 'var(--text-muted)' }}
            title={sidebarOpen ? 'Collapse' : 'Expand'}
          >
            {sidebarOpen ? <PanelLeftClose size={14} /> : <PanelLeftOpen size={14} />}
          </button>
        </div>

        <div className="mx-3 h-px shrink-0" style={{ background: 'var(--border-subtle)' }} />

        {/* Nav items */}
        <nav className="flex-1 p-2.5 space-y-0.5 overflow-hidden">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link key={item.name} href={item.href} title={!sidebarOpen ? item.name : undefined}>
                <div
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-150 overflow-hidden',
                    isActive ? 'nav-item-active' : 'hover:bg-[var(--nav-item-hover)]',
                  )}
                  style={{ color: isActive ? 'var(--nav-item-active-color)' : 'var(--text-secondary)' }}
                >
                  <item.icon size={16} className="shrink-0" />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.12 }}
                        className="truncate text-sm font-semibold"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Theme at bottom */}
        <div className="p-2.5 shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {sidebarOpen && (
            <p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Theme
            </p>
          )}
          <ThemeSwitcher compact={!sidebarOpen} />
        </div>
      </motion.aside>

      {/* ── Mobile bottom nav ── */}
      <nav
        className="fixed bottom-4 left-4 right-4 z-50 flex h-16 items-center justify-around rounded-2xl px-2 md:hidden"
        style={{
          background: 'var(--nav-bg)',
          border: '1px solid var(--nav-border)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          boxShadow: 'var(--shadow-soft)',
        }}
      >
        {navItems.map((item) => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1">
              <div
                className="rounded-xl p-2 transition-all duration-150"
                style={{
                  background: isActive ? 'var(--accent-light)' : undefined,
                  color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
                }}
              >
                <item.icon size={18} />
              </div>
              <span
                className="text-[9px] font-semibold"
                style={{ color: isActive ? 'var(--accent)' : 'var(--text-muted)' }}
              >
                {item.name}
              </span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
