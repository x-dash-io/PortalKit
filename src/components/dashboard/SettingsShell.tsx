'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, CreditCard, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard/settings', label: 'Notifications', icon: Bell },
  { href: '/dashboard/settings/profile', label: 'Profile', icon: User },
  { href: '/dashboard/settings/billing', label: 'Billing & Plan', icon: CreditCard },
];

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="space-y-4">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Workspace</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Settings</h1>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
            Control notification rules, workspace identity, and plan visibility from one place.
          </p>
        </div>

        <div className="glass-card rounded-[2rem] p-3">
          <nav className="flex flex-col gap-1.5">
            {items.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]'
                  )}
                >
                  <item.icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      <div>{children}</div>
    </div>
  );
}
