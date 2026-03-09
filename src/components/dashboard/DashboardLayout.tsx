'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Search, User, LogOut, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassNav } from '@/components/dashboard/GlassNav';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { StorageQuota } from '@/components/dashboard/StorageQuota';
import { useUIStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUIStore();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchDefault = pathname.startsWith('/dashboard/projects') ? searchParams.get('q') ?? '' : '';

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const value = String(formData.get('query') ?? '').trim();
    router.push(value ? `/dashboard/projects?q=${encodeURIComponent(value)}` : '/dashboard/projects');
  };

  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <GlassNav />

      <motion.div
        initial={false}
        animate={{ paddingLeft: sidebarOpen ? '272px' : '96px' }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen pb-24 md:pb-0"
      >
        <header className="sticky top-0 z-40 border-b border-[var(--border-subtle)] bg-[color-mix(in_srgb,var(--surface-elevated)_88%,transparent)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 px-6 py-4 lg:px-10 xl:flex-row xl:items-center xl:justify-between">
            <form onSubmit={handleSearch} className="flex w-full max-w-2xl items-center gap-3 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-soft)]">
              <Search size={18} className="text-[var(--text-muted)]" />
              <input
                key={`${pathname}-${searchDefault}`}
                name="query"
                defaultValue={searchDefault}
                placeholder="Search projects, clients, or email"
                className="w-full bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder:text-[var(--text-muted)]"
              />
              <Button type="submit" size="sm" className="rounded-2xl px-4">
                Search
              </Button>
            </form>

            <div className="flex items-center justify-between gap-4 xl:justify-end">
              <NotificationBell />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] px-3 py-2 text-left shadow-[var(--shadow-soft)] transition-colors hover:border-[var(--border-strong)]">
                    <Avatar className="h-11 w-11 border border-[var(--border-subtle)]">
                      <AvatarImage src={session?.user?.image || ''} />
                      <AvatarFallback className="bg-[var(--accent-light)] font-semibold text-[var(--accent)]">
                        {session?.user?.name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden min-w-0 lg:block">
                      <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{session?.user?.name}</p>
                      <p className="mt-1 text-[10px] font-mono uppercase tracking-[0.24em] text-[var(--text-muted)]">
                        {session?.user?.plan === 'pro' ? 'Pro workspace' : 'Starter workspace'}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-72 rounded-3xl border-[var(--border-subtle)] bg-[var(--surface)] p-2 shadow-[var(--shadow-soft)]">
                  <DropdownMenuLabel className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">
                    Account
                  </DropdownMenuLabel>
                  <div className="px-3 py-2">
                    <StorageQuota />
                  </div>
                  <DropdownMenuSeparator className="bg-[var(--border-subtle)]" />
                  <DropdownMenuItem asChild className="rounded-2xl px-3 py-3 focus:bg-[var(--accent-light)] focus:text-[var(--accent)]">
                    <Link href="/dashboard/settings/profile">
                      <User size={18} />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-2xl px-3 py-3 focus:bg-[var(--accent-light)] focus:text-[var(--accent)]">
                    <Link href="/dashboard/settings/billing">
                      <CreditCard size={18} />
                      <span>Billing & Plan</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-2xl px-3 py-3 text-[var(--destructive)] focus:bg-red-50 focus:text-[var(--destructive)]"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        <main className="relative p-6 lg:p-10">
          <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_right,var(--canvas-accent),transparent_28%)] opacity-80" />
          <div className="relative">{children}</div>
        </main>
      </motion.div>
    </div>
  );
}
