'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Palette, Save, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeSwitcher } from '@/components/themes/ThemeSwitcher';
import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserProfile } from '@/lib/contracts';

export default function SettingsProfilePage() {
  const { update } = useSession();
  const [profile, setProfile] = useState<Partial<UserProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadProfile = async () => {
      try {
        const res = await fetch('/api/user/settings');
        if (!res.ok) throw new Error('Failed to fetch profile');
        const data = (await res.json()) as UserProfile;
        if (!cancelled) setProfile(data);
      } catch {
        if (!cancelled) toast.error('Could not load profile settings');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void loadProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: {
            name: profile.name,
            avatar: profile.avatar,
            logo: profile.logo,
            accentColor: profile.accentColor,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to save profile');

      await update({
        user: {
          name: profile.name,
          avatar: profile.avatar,
          accentColor: profile.accentColor,
        },
      });

      toast.success('Profile updated');
    } catch {
      toast.error('Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <GlassCard className="rounded-[2rem] p-8" hoverable={false}>
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--accent-light)] text-[var(--accent)]">
            <UserCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Profile</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Set the account identity and brand details used across the workspace and portal.</p>
          </div>
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-[1.75rem] bg-[var(--surface)]" />
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="Display name" id="profile-name">
              <Input
                id="profile-name"
                value={profile.name ?? ''}
                onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
              />
            </Field>
            <Field label="Email" id="profile-email">
              <Input id="profile-email" value={profile.email ?? ''} disabled />
            </Field>
            <Field label="Avatar URL" id="profile-avatar">
              <Input
                id="profile-avatar"
                value={profile.avatar ?? ''}
                onChange={(event) => setProfile((current) => ({ ...current, avatar: event.target.value }))}
              />
            </Field>
            <Field label="Logo URL" id="profile-logo">
              <Input
                id="profile-logo"
                value={profile.logo ?? ''}
                onChange={(event) => setProfile((current) => ({ ...current, logo: event.target.value }))}
              />
            </Field>
            <Field label="Accent color" id="profile-accent">
              <Input
                id="profile-accent"
                value={profile.accentColor ?? ''}
                onChange={(event) => setProfile((current) => ({ ...current, accentColor: event.target.value }))}
                placeholder="#0F766E"
              />
            </Field>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Button className="rounded-2xl px-5" disabled={saving} onClick={saveProfile}>
            <Save size={16} />
            {saving ? 'Saving...' : 'Save profile'}
          </Button>
        </div>
      </GlassCard>

      <GlassCard className="rounded-[2rem] p-8" hoverable={false}>
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--muted)] text-[var(--text-primary)]">
            <Palette size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Theme</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Choose the visual mode for your dashboard and client-facing portal.</p>
          </div>
        </div>
        <ThemeSwitcher />
      </GlassCard>
    </div>
  );
}

function Field({
  id,
  label,
  children,
}: {
  id: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
