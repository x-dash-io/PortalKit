'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { CheckCircle2, Clock, Eye, FileText, Mail, Save, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_EMAIL_PREFERENCES, type EmailPreferences } from '@/lib/contracts';

export default function SettingsNotificationsPage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState<EmailPreferences>(DEFAULT_EMAIL_PREFERENCES);

  useEffect(() => {
    if (session?.user?.emailPreferences) setPreferences(session.user.emailPreferences);
  }, [session]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailPreferences: preferences }),
      });
      if (!res.ok) throw new Error('Failed to save');
      await update({ user: { emailPreferences: preferences } });
      toast.success('Notification preferences saved');
    } catch {
      toast.error('Could not save preferences');
    } finally {
      setLoading(false);
    }
  };

  const prefs = [
    {
      key: 'invoiceViewed' as keyof EmailPreferences,
      icon: <FileText size={17} />,
      iconColor: 'var(--success)',
      iconBg: 'var(--success-bg)',
      title: 'Invoice viewed',
      description: 'Get notified when a client opens an invoice.',
    },
    {
      key: 'approvalResponded' as keyof EmailPreferences,
      icon: <CheckCircle2 size={17} />,
      iconColor: 'var(--accent)',
      iconBg: 'var(--accent-light)',
      title: 'Approval responded',
      description: 'Get notified when a client approves work or requests changes.',
    },
    {
      key: 'portalVisited' as keyof EmailPreferences,
      icon: <Eye size={17} />,
      iconColor: 'var(--accent)',
      iconBg: 'var(--accent-light)',
      title: 'Portal visited',
      description: 'Get notified when a client revisits your project portal.',
    },
    {
      key: 'overdueReminders' as keyof EmailPreferences,
      icon: <Clock size={17} />,
      iconColor: 'var(--warning)',
      iconBg: 'var(--warning-bg)',
      title: 'Overdue reminders',
      description: 'Allow PortalKit to email clients about overdue invoices automatically.',
    },
  ];

  return (
    <div
      className="rounded-2xl overflow-hidden animate-fade-up"
      style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-6 py-5"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-xl"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
          >
            <Mail size={22} />
          </div>
          <div>
            <h2 className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Email notifications
            </h2>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Choose which events trigger an email to you.
            </p>
          </div>
        </div>

        <button
          disabled={loading}
          onClick={handleSave}
          className="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'var(--accent)',
            color: 'var(--primary-foreground)',
            boxShadow: loading ? 'none' : 'var(--glow-sm)',
          }}
        >
          {loading ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {loading ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      {/* Preferences */}
      <div className="p-6 space-y-3">
        {prefs.map(({ key, icon, iconColor, iconBg, title, description }) => (
          <div
            key={key}
            className="flex flex-col gap-4 rounded-xl p-4 md:flex-row md:items-center md:justify-between transition-colors"
            style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}
          >
            <div className="flex gap-3.5">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: iconBg, color: iconColor }}
              >
                {icon}
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
                <p className="text-sm leading-relaxed mt-0.5" style={{ color: 'var(--text-secondary)' }}>{description}</p>
              </div>
            </div>
            <Switch
              checked={preferences[key]}
              onCheckedChange={() =>
                setPreferences((cur) => ({ ...cur, [key]: !cur[key] }))
              }
              className="shrink-0"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
