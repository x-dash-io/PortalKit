'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { FolderKanban, LayoutDashboard, PanelLeftClose, PanelLeftOpen, Settings, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/themes/ThemeSwitcher';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function GlassNav() {
  const pathname = usePathname();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 272 : 96 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className={cn(
          'fixed left-0 top-0 z-50 hidden h-screen flex-col border-r border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-elevated)_92%,transparent)] px-4 py-5 backdrop-blur-xl md:flex',
          !sidebarOpen && 'items-center'
        )}
      >
        <div className="flex w-full items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-[var(--glow)]">
              <ShieldCheck size={20} />
            </div>
            {sidebarOpen && (
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">PortalKit</p>
                <p className="text-xs text-[var(--text-secondary)]">Client operations</p>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-2xl text-[var(--text-secondary)] hover:bg-[var(--accent-light)] hover:text-[var(--accent)]"
          >
            {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
          </Button>
        </div>

        <nav className="mt-8 flex-1 space-y-2">
          {navItems.map((item) => {
            const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);

            return (
              <Link key={item.name} href={item.href}>
                <div
                  className={cn(
                    'group relative flex items-center gap-3 overflow-hidden rounded-3xl border px-4 py-3.5 transition-all',
                    isActive
                      ? 'border-[var(--accent)]/15 bg-[var(--accent-light)] text-[var(--accent)]'
                      : 'border-transparent text-[var(--text-secondary)] hover:border-[var(--border-subtle)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
                  )}
                >
                  {isActive && (
                    <motion.div layoutId="nav-highlight" className="absolute inset-y-2 left-2 w-1 rounded-full bg-[var(--accent)]" />
                  )}
                  <item.icon size={20} className="shrink-0" />
                  {sidebarOpen && <span className="truncate text-sm font-semibold">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className={cn('space-y-4 border-t border-[var(--border-subtle)] px-2 pt-5', !sidebarOpen && 'flex flex-col items-center')}>
          {sidebarOpen && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Workspace theme</p>
          )}
          <ThemeSwitcher />
        </div>
      </motion.aside>

      <nav className="fixed bottom-4 left-4 right-4 z-50 flex h-18 items-center justify-around rounded-[2rem] border border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-elevated)_92%,transparent)] px-4 shadow-[var(--shadow-soft)] backdrop-blur-xl md:hidden">
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);

          return (
            <Link key={item.name} href={item.href} className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  'rounded-2xl p-3 transition-all',
                  isActive
                    ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                    : 'text-[var(--text-secondary)]'
                )}
              >
                <item.icon size={22} />
              </div>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
