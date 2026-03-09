'use client';

import { useEffect, useState } from 'react';
import bytes from 'bytes';
import { CreditCard, HardDrive, Rocket, ShieldCheck } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import type { UserProfile } from '@/lib/contracts';

export default function SettingsBillingPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      const res = await fetch('/api/user/settings');
      if (!res.ok) return;
      const data = (await res.json()) as UserProfile;
      if (!cancelled) setProfile(data);
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const quota = 5 * 1024 * 1024 * 1024;
  const storageUsed = profile?.storageUsed ?? 0;
  const storagePercent = Math.min((storageUsed / quota) * 100, 100);

  return (
    <div className="space-y-6">
      <GlassCard className="rounded-[2rem] p-8" hoverable={false}>
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--accent-light)] text-[var(--accent)]">
            <CreditCard size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Billing & Plan</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Track plan status, storage usage, and the upgrade surface that will connect to billing later.</p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <MetricCard icon={<Rocket size={20} />} label="Current Plan" value={profile?.plan?.toUpperCase() ?? 'FREE'} />
          <MetricCard icon={<HardDrive size={20} />} label="Storage Used" value={bytes(storageUsed) ?? '0 B'} />
          <MetricCard icon={<ShieldCheck size={20} />} label="Storage Limit" value="5 GB" />
        </div>

        <div className="mt-8 rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface)] p-6">
          <div className="mb-3 flex items-center justify-between text-sm text-[var(--text-secondary)]">
            <span>Storage consumption</span>
            <span>{Math.round(storagePercent)}%</span>
          </div>
          <div className="h-3 rounded-full bg-[var(--muted)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] via-cyan-500 to-emerald-500"
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">
            Payment provider hooks are not enabled in this cycle, but this surface is now ready for a real billing integration.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <InfoTile
            title="Plan recommendation"
            description="Starter is enough for single-client delivery. Move to Pro when your file volume and approval traffic increases."
          />
          <InfoTile
            title="Integration status"
            description="Storage, usage, and plan metadata are live. Checkout, invoicing sync, and card management can be wired on top."
          />
        </div>
      </GlassCard>
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--text-primary)]">{icon}</div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function InfoTile({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
      <h3 className="text-base font-medium text-[var(--text-primary)]">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
    </div>
  );
}
