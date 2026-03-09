'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Search, User, LogOut, CreditCard, X, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { GlassNav } from '@/components/dashboard/GlassNav';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import { StorageQuota } from '@/components/dashboard/StorageQuota';
import { useUIStore } from '@/lib/store';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useState, useRef, useCallback } from 'react';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen } = useUIStore();
  const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchDefault = pathname.startsWith('/dashboard/projects') ? searchParams.get('q') ?? '' : '';
  const [searchValue, setSearchValue] = useState(searchDefault);
  const [searchFocused, setSearchFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const value = searchValue.trim();
      router.push(value ? `/dashboard/projects?q=${encodeURIComponent(value)}` : '/dashboard/projects');
    },
    [searchValue, router],
  );

  const clearSearch = useCallback(() => {
    setSearchValue('');
    inputRef.current?.focus();
    if (pathname.startsWith('/dashboard/projects')) router.push('/dashboard/projects');
  }, [pathname, router]);

  const initials = session?.user?.name
    ?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  return (
    <div style={{ minHeight: '100vh', background: 'var(--canvas)' }}>
      <GlassNav />

      <motion.div
        initial={false}
        animate={{ paddingLeft: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.26, ease: [0.4, 0, 0.2, 1] }}
        className="min-h-screen pb-24 md:pb-0"
      >
        {/* ── Top header ── */}
        <header
          className="sticky top-0 z-40 h-[60px] flex items-center"
          style={{
            background: 'var(--nav-bg)',
            borderBottom: '1px solid var(--nav-border)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
          }}
        >
          <div className="flex w-full items-center gap-3 px-5">
            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="flex flex-1 max-w-sm items-center gap-2.5 rounded-xl px-3 py-2 transition-all duration-150"
              style={{
                background: 'var(--surface-muted)',
                border: `1px solid ${searchFocused ? 'var(--accent)' : 'var(--border-subtle)'}`,
                boxShadow: searchFocused ? 'var(--glow-accent)' : 'none',
              }}
            >
              <Search
                size={13}
                style={{ color: searchFocused ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0, transition: 'color 0.15s' }}
              />
              <input
                ref={inputRef}
                key={`${pathname}-${searchDefault}`}
                name="query"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                onKeyDown={(e) => e.key === 'Escape' && clearSearch()}
                placeholder="Search projects…"
                className="flex-1 bg-transparent text-sm outline-none min-w-0"
                style={{ color: 'var(--text-primary)' }}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="flex h-5 w-5 items-center justify-center rounded-md transition-colors hover:bg-[var(--accent-light)]"
                  style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                  aria-label="Clear search"
                >
                  <X size={11} />
                </button>
              )}
            </form>

            <div className="flex items-center gap-1.5 ml-auto">
              <NotificationBell />

              {/* User menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 transition-all duration-150 hover:bg-[var(--surface-hover)]"
                    style={{ border: '1px solid var(--border-subtle)' }}
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={session?.user?.image || ''} />
                      <AvatarFallback
                        className="text-[11px] font-black"
                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-xs font-semibold leading-none" style={{ color: 'var(--text-primary)' }}>
                        {session?.user?.name}
                      </p>
                      <p className="mt-0.5 text-[10px] uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {session?.user?.plan === 'pro' ? 'Pro' : 'Starter'}
                      </p>
                    </div>
                    <ChevronDown size={12} style={{ color: 'var(--text-muted)' }} className="hidden lg:block" />
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  align="end"
                  sideOffset={8}
                  className="w-64 rounded-2xl p-1.5"
                  style={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border-medium)',
                    boxShadow: 'var(--shadow-modal)',
                  }}
                >
                  <DropdownMenuLabel
                    className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    Account
                  </DropdownMenuLabel>
                  <div className="px-3 pb-2">
                    <StorageQuota />
                  </div>
                  <DropdownMenuSeparator style={{ background: 'var(--border-subtle)' }} />
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-[var(--accent-light)] focus:text-[var(--accent)]">
                    <Link href="/dashboard/settings/profile" className="flex items-center gap-2.5">
                      <User size={14} />
                      <span className="text-sm font-medium">Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl px-3 py-2.5 cursor-pointer focus:bg-[var(--accent-light)] focus:text-[var(--accent)]">
                    <Link href="/dashboard/settings/billing" className="flex items-center gap-2.5">
                      <CreditCard size={14} />
                      <span className="text-sm font-medium">Billing & Plan</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator style={{ background: 'var(--border-subtle)' }} />
                  <DropdownMenuItem
                    className="rounded-xl px-3 py-2.5 cursor-pointer gap-2.5 focus:bg-[var(--destructive-bg)]"
                    style={{ color: 'var(--destructive)' }}
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    <LogOut size={14} />
                    <span className="text-sm font-medium">Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* ── Main content ── */}
        <main className="relative p-5 lg:p-7">
          <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
            <div
              className="ambient-blob"
              style={{ background: 'var(--accent)', width: 300, height: 300, top: -80, right: -60 }}
            />
            <div
              className="ambient-blob"
              style={{ background: 'var(--accent-2)', width: 240, height: 240, bottom: -80, left: -40, opacity: 0.09 }}
            />
          </div>
          <div className="relative max-w-7xl mx-auto">{children}</div>
        </main>
      </motion.div>
    </div>
  );
}
