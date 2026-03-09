'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle2, Clock, Eye, FileText, Mail, Save } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/glass/GlassCard';
import { DEFAULT_EMAIL_PREFERENCES, type EmailPreferences } from '@/lib/contracts';

export default function SettingsNotificationsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<EmailPreferences>(DEFAULT_EMAIL_PREFERENCES);

  useEffect(() => {
    if (session?.user?.emailPreferences) {
      setPreferences(session.user.emailPreferences);
    }
  }, [session]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailPreferences: preferences }),
      });

      if (!res.ok) throw new Error('Failed to save preferences');

      await update({
        user: {
          emailPreferences: preferences,
        },
      });

      toast.success('Notification preferences updated');
    } catch {
      toast.error('Could not save notification preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="rounded-[2rem] p-8" hoverable={false}>
      <div className="flex flex-col gap-4 border-b border-[var(--border-subtle)] pb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--accent-light)] text-[var(--accent)]">
            <Mail size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Notification preferences</h2>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">Decide which client and billing events should reach you automatically.</p>
          </div>
        </div>

        <Button className="rounded-2xl px-5" disabled={loading} onClick={handleSave}>
          <Save size={16} />
          {loading ? 'Saving...' : 'Save changes'}
        </Button>
      </div>

      <div className="mt-8 space-y-4">
        <PreferenceToggle
          icon={<FileText className="text-emerald-600" size={18} />}
          title="Invoice viewed"
          description="Notify me when a client opens an invoice."
          checked={preferences.invoiceViewed}
          onCheckedChange={() => setPreferences((current) => ({ ...current, invoiceViewed: !current.invoiceViewed }))}
        />
        <PreferenceToggle
          icon={<CheckCircle2 className="text-blue-600" size={18} />}
          title="Approval responded"
          description="Notify me when a client approves work or requests changes."
          checked={preferences.approvalResponded}
          onCheckedChange={() =>
            setPreferences((current) => ({ ...current, approvalResponded: !current.approvalResponded }))
          }
        />
        <PreferenceToggle
          icon={<Eye className="text-[var(--accent)]" size={18} />}
          title="Portal visited"
          description="Notify me when the client revisits the project portal."
          checked={preferences.portalVisited}
          onCheckedChange={() => setPreferences((current) => ({ ...current, portalVisited: !current.portalVisited }))}
        />
        <PreferenceToggle
          icon={<Clock className="text-amber-600" size={18} />}
          title="Overdue reminders"
          description="Allow PortalKit to email clients about overdue invoices."
          checked={preferences.overdueReminders}
          onCheckedChange={() =>
            setPreferences((current) => ({ ...current, overdueReminders: !current.overdueReminders }))
          }
        />
      </div>
    </GlassCard>
  );
}

function PreferenceToggle({
  icon,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: () => void;
}) {
  return (
    <div className="flex flex-col gap-5 rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 md:flex-row md:items-center md:justify-between">
      <div className="flex gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--muted)]">{icon}</div>
        <div className="space-y-1">
          <p className="font-medium text-[var(--text-primary)]">{title}</p>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
