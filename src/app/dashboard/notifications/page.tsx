'use client';

import { useEffect, useState, useCallback } from 'react';
import { Bell, CheckCircle2, CheckCheck, FolderKanban, FileText, Eye, Clock, DollarSign, MailOpen } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import Link from 'next/link';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import type { NotificationRecord, NotificationType } from '@/lib/contracts';

const ICON_MAP: Record<NotificationType, React.ReactNode> = {
  PORTAL_VISITED:      <Eye size={16} />,
  INVOICE_SENT:        <FileText size={16} />,
  INVOICE_VIEWED:      <MailOpen size={16} />,
  INVOICE_PAID:        <DollarSign size={16} />,
  INVOICE_OVERDUE:     <Clock size={16} />,
  APPROVAL_REQUESTED:  <CheckCircle2 size={16} />,
  APPROVAL_RESPONDED:  <CheckCircle2 size={16} />,
};

const COLOR_MAP: Record<NotificationType, string> = {
  PORTAL_VISITED:      'var(--accent)',
  INVOICE_SENT:        'var(--accent)',
  INVOICE_VIEWED:      'var(--success)',
  INVOICE_PAID:        'var(--success)',
  INVOICE_OVERDUE:     'var(--warning)',
  APPROVAL_REQUESTED:  'var(--accent)',
  APPROVAL_RESPONDED:  'var(--success)',
};

const BG_MAP: Record<NotificationType, string> = {
  PORTAL_VISITED:      'var(--accent-light)',
  INVOICE_SENT:        'var(--accent-light)',
  INVOICE_VIEWED:      'var(--success-bg)',
  INVOICE_PAID:        'var(--success-bg)',
  INVOICE_OVERDUE:     'rgba(245,158,11,0.12)',
  APPROVAL_REQUESTED:  'var(--accent-light)',
  APPROVAL_RESPONDED:  'var(--success-bg)',
};

const LABEL_MAP: Record<NotificationType, string> = {
  PORTAL_VISITED:      'Portal visited',
  INVOICE_SENT:        'Invoice sent',
  INVOICE_VIEWED:      'Invoice viewed',
  INVOICE_PAID:        'Invoice paid',
  INVOICE_OVERDUE:     'Invoice overdue',
  APPROVAL_REQUESTED:  'Approval requested',
  APPROVAL_RESPONDED:  'Approval responded',
};

function getDescription(n: NotificationRecord): string {
  const project = n.project?.title ?? 'a project';
  const meta = n.metadata ?? {};
  switch (n.type) {
    case 'PORTAL_VISITED':      return `Your client visited the portal for ${project}.`;
    case 'INVOICE_SENT':        return `Invoice #${meta.invoiceNumber ?? ''} was sent for ${project}.`;
    case 'INVOICE_VIEWED':      return `Your client viewed invoice #${meta.invoiceNumber ?? ''} for ${project}.`;
    case 'INVOICE_PAID':        return `Invoice #${meta.invoiceNumber ?? ''} for ${project} was marked paid.`;
    case 'INVOICE_OVERDUE':     return `Invoice #${meta.invoiceNumber ?? ''} for ${project} is overdue.`;
    case 'APPROVAL_REQUESTED':  return `Approval "${String(meta.approvalTitle ?? '')}" was sent to your client for ${project}.`;
    case 'APPROVAL_RESPONDED':  return `Your client responded to approval "${String(meta.approvalTitle ?? '')}" in ${project}.`;
    default:                    return `Activity in ${project}.`;
  }
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error();
      const data = (await res.json()) as NotificationRecord[];
      setNotifications(data);
    } catch {
      toast.error('Could not load notifications');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchNotifications(); }, [fetchNotifications]);

  const markAllRead = async () => {
    setMarkingAll(true);
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readAll: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Could not update notifications');
    } finally {
      setMarkingAll(false);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            Activity feed
          </p>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Notifications
          </h1>
          {!loading && (
            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          )}
        </div>
        {unreadCount > 0 && (
          <GlassButton
            variant="secondary"
            onClick={() => void markAllRead()}
            disabled={markingAll}
            className="gap-2 text-sm"
          >
            <CheckCheck size={15} />
            Mark all read
          </GlassButton>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-20 rounded-2xl animate-pulse"
              style={{ background: 'var(--surface-muted)' }}
            />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <GlassCard className="p-16 text-center">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'var(--surface-muted)' }}
          >
            <Bell size={28} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
            No notifications yet
          </h3>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Activity from your client portals will appear here.
          </p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className="group relative flex items-start gap-4 rounded-2xl p-4 transition-all duration-150"
              style={{
                background: n.read ? 'var(--surface-muted)' : 'var(--surface)',
                border: `1px solid ${n.read ? 'var(--border-subtle)' : 'var(--border-medium)'}`,
                opacity: n.read ? 0.75 : 1,
              }}
            >
              {/* Icon */}
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{
                  background: BG_MAP[n.type] ?? 'var(--accent-light)',
                  color: COLOR_MAP[n.type] ?? 'var(--accent)',
                }}
              >
                {ICON_MAP[n.type] ?? <Bell size={16} />}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {LABEL_MAP[n.type] ?? n.type}
                  </p>
                  <div className="flex items-center gap-2 shrink-0">
                    {!n.read && (
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ background: 'var(--accent)' }}
                      />
                    )}
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {getDescription(n)}
                </p>
                {n.project && (
                  <Link
                    href={`/dashboard/projects/${n.project._id}`}
                    className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold transition-colors hover:text-[var(--accent)]"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <FolderKanban size={11} />
                    {n.project.title}
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
