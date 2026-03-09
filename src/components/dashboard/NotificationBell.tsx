'use client';

import React, { useState } from 'react';
import {
  Bell, Eye, FileText, CheckCircle2, Clock, Check, Settings, X,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { NotificationRecord } from '@/lib/contracts';
import { getNotificationMessage } from '@/lib/notifications';

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  PORTAL_VISITED:      { icon: <Eye size={14} />,          color: 'var(--accent)',    bg: 'var(--accent-light)' },
  INVOICE_SENT:        { icon: <FileText size={14} />,     color: 'var(--success)',   bg: 'var(--success-bg)' },
  INVOICE_PAID:        { icon: <FileText size={14} />,     color: 'var(--success)',   bg: 'var(--success-bg)' },
  APPROVAL_REQUESTED:  { icon: <CheckCircle2 size={14} />, color: 'var(--accent)',    bg: 'var(--accent-light)' },
  APPROVAL_RESPONDED:  { icon: <Check size={14} />,        color: 'var(--success)',   bg: 'var(--success-bg)' },
  INVOICE_OVERDUE:     { icon: <Clock size={14} />,        color: 'var(--destructive)', bg: 'var(--destructive-bg)' },
};

const defaultType = { icon: <Bell size={14} />, color: 'var(--accent)', bg: 'var(--accent-light)' };

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: notifications = [] } = useQuery<NotificationRecord[]>({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch('/api/notifications');
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readAll: true }),
      });
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-150 hover:bg-[var(--surface-hover)]"
          style={{ border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
          aria-label="Notifications"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span
              className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-black text-white"
              style={{ background: 'var(--destructive)', boxShadow: '0 0 0 2px var(--canvas)' }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-[340px] rounded-2xl p-0 overflow-hidden"
        style={{
          background: 'var(--popover)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div>
            <p className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>
              Notifications
            </p>
            <p className="text-[10px] font-bold uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
              {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            {unreadCount > 0 && (
              <button
                onClick={(e) => { e.stopPropagation(); markReadMutation.mutate(); }}
                className="text-[10px] font-bold px-2.5 py-1 rounded-lg transition-colors hover:bg-[var(--accent-light)]"
                style={{ color: 'var(--accent)' }}
              >
                Mark all read
              </button>
            )}
            <button
              onClick={() => setIsOpen(false)}
              className="flex h-6 w-6 items-center justify-center rounded-lg transition-colors hover:bg-[var(--surface-hover)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <X size={12} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="max-h-[380px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-2xl mb-3"
                style={{ background: 'var(--surface-muted)' }}
              >
                <Bell size={20} style={{ color: 'var(--text-muted)' }} />
              </div>
              <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>All quiet here</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                You&apos;ll be notified when clients take action.
              </p>
            </div>
          ) : (
            notifications.map((n) => {
              const cfg = typeConfig[n.type] ?? defaultType;
              return (
                <button
                  key={n._id}
                  onClick={() => {
                    if (n.project?._id) { router.push(`/dashboard/projects/${n.project._id}`); setIsOpen(false); }
                  }}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors',
                    'hover:bg-[var(--surface-hover)]',
                  )}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    background: !n.read ? 'var(--accent-light)' : 'transparent',
                  }}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl mt-0.5"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    {cfg.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p
                      className={cn('text-xs leading-relaxed', !n.read ? 'font-semibold' : 'font-medium')}
                      style={{ color: !n.read ? 'var(--text-primary)' : 'var(--text-secondary)' }}
                    >
                      {getNotificationMessage(n.type, n.project?.title || 'a project')}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </span>
                      {!n.read && (
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ background: 'var(--accent)' }}
                        />
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div
            className="flex items-center justify-center px-4 py-2.5"
            style={{ borderTop: '1px solid var(--border-subtle)' }}
          >
            <button
              onClick={() => { router.push('/dashboard/settings'); setIsOpen(false); }}
              className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors hover:text-[var(--accent)]"
              style={{ color: 'var(--text-muted)' }}
            >
              <Settings size={11} />
              Notification settings
            </button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
