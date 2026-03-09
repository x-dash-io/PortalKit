'use client';

import { useEffect, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Camera, Loader2, Palette, Save, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeSwitcher } from '@/components/themes/ThemeSwitcher';
import { GlassCard } from '@/components/glass/GlassCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserProfile } from '@/lib/contracts';

type ImageField = 'avatar' | 'logo';

function ImageUploader({
  label,
  field,
  value,
  onChange,
}: {
  label: string;
  field: ImageField;
  value?: string;
  onChange: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be under 5MB');
      return;
    }

    setUploading(true);
    try {
      const presignRes = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: file.name, mimeType: file.type, field }),
      });
      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, publicUrl } = await presignRes.json();

      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });
      if (!uploadRes.ok) throw new Error('Upload failed');

      onChange(publicUrl);
      toast.success(`${label} uploaded`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="flex items-center gap-3">
        <div
          className="relative h-16 w-16 shrink-0 cursor-pointer overflow-hidden rounded-2xl transition-opacity hover:opacity-80"
          style={{ background: 'var(--surface-muted)', border: '2px solid var(--border-medium)' }}
          onClick={() => inputRef.current?.click()}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ color: 'var(--text-muted)' }}>
              <UserCircle2 size={24} />
            </div>
          )}
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          >
            {uploading ? (
              <Loader2 size={16} className="animate-spin text-white" />
            ) : (
              <Camera size={16} className="text-white" />
            )}
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <Input
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Paste URL or click image to upload"
            style={{ fontSize: '0.8rem' }}
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="text-xs font-semibold transition-colors hover:underline disabled:opacity-50"
            style={{ color: 'var(--accent)' }}
          >
            {uploading ? 'Uploading…' : `Upload ${label.toLowerCase()}`}
          </button>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}

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
    return () => { cancelled = true; };
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: { name: profile.name, avatar: profile.avatar, logo: profile.logo, accentColor: profile.accentColor },
        }),
      });
      if (!res.ok) throw new Error('Failed to save profile');
      await update({ user: { name: profile.name, avatar: profile.avatar, accentColor: profile.accentColor } });
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
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Set your account identity and brand details used across the workspace and portal.</p>
          </div>
        </div>

        {loading ? (
          <div className="h-40 animate-pulse rounded-[1.75rem] bg-[var(--surface)]" />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Display name" id="profile-name">
                <Input id="profile-name" value={profile.name ?? ''} onChange={(e) => setProfile((c) => ({ ...c, name: e.target.value }))} />
              </Field>
              <Field label="Email" id="profile-email">
                <Input id="profile-email" value={profile.email ?? ''} disabled />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <ImageUploader label="Avatar" field="avatar" value={profile.avatar} onChange={(url) => setProfile((c) => ({ ...c, avatar: url }))} />
              <ImageUploader label="Logo" field="logo" value={profile.logo} onChange={(url) => setProfile((c) => ({ ...c, logo: url }))} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Accent color" id="profile-accent">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={profile.accentColor ?? '#6366f1'}
                    onChange={(e) => setProfile((c) => ({ ...c, accentColor: e.target.value }))}
                    className="h-10 w-10 cursor-pointer rounded-lg p-0.5"
                    style={{ border: '1px solid var(--border-medium)', background: 'var(--surface-muted)' }}
                  />
                  <Input id="profile-accent" value={profile.accentColor ?? ''} onChange={(e) => setProfile((c) => ({ ...c, accentColor: e.target.value }))} placeholder="#6366f1" className="flex-1" />
                </div>
              </Field>
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <Button className="rounded-2xl px-5" disabled={saving} onClick={saveProfile}>
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
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

function Field({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}
