'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, CreditCard, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard/settings',         label: 'Notifications', icon: Bell,       desc: 'Email & alert rules' },
  { href: '/dashboard/settings/profile', label: 'Profile',       icon: User,       desc: 'Name, avatar, branding' },
  { href: '/dashboard/settings/billing', label: 'Billing',       icon: CreditCard, desc: 'Plan & usage' },
];

export function SettingsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
      <aside className="space-y-5">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            Workspace
          </p>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Settings
          </h1>
          <p className="text-sm mt-1 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Manage your workspace, notifications, and plan.
          </p>
        </div>

        <nav className="glass-card rounded-2xl p-2 space-y-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all duration-150',
                  isActive
                    ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]'
                )}
              >
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    background: isActive ? 'var(--accent)' : 'var(--surface-muted)',
                    color: isActive ? 'white' : 'var(--text-muted)',
                  }}
                >
                  <item.icon size={14} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-none">{item.label}</p>
                  <p className="text-[10px] mt-0.5 opacity-70">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
