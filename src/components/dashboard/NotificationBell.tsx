'use client';

import React, { useState } from 'react';
import {
    Bell,
    Eye,
    FileText,
    CheckCircle2,
    Clock,
    Check,
    Settings
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import type { NotificationRecord } from '@/lib/contracts';
import { getNotificationMessage } from '@/lib/notifications';

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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        },
    });

    const unreadCount = notifications.filter(n => !n.read).length;

    const getIcon = (type: string) => {
        switch (type) {
            case 'PORTAL_VISITED': return <Eye size={16} className="text-blue-400" />;
            case 'INVOICE_SENT':
            case 'INVOICE_PAID': return <FileText size={16} className="text-emerald-400" />;
            case 'APPROVAL_REQUESTED': return <CheckCircle2 size={16} className="text-indigo-400" />;
            case 'APPROVAL_RESPONDED': return <Check size={16} className="text-purple-400" />;
            case 'INVOICE_OVERDUE': return <Clock size={16} className="text-red-400" />;
            default: return <Bell size={16} className="text-[var(--accent)]" />;
        }
    };

    const handleNotificationClick = (notification: NotificationRecord) => {
        if (notification.project?._id) {
            router.push(`/dashboard/projects/${notification.project._id}`);
            setIsOpen(false);
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <button className="relative p-2.5 rounded-2xl hover:bg-white/5 transition-all text-[var(--text-secondary)] hover:text-indigo-400 group focus:outline-none">
                    <Bell size={22} className={cn("transition-transform group-active:scale-90", unreadCount > 0 && "animate-[bell-shake_0.5s_ease-in-out_infinite]")} />
                    {unreadCount > 0 && (
                        <span className="absolute top-2.5 right-2.5 w-4 h-4 bg-red-500 rounded-full border-2 border-[var(--bg-base)] shadow-[0_0_10px_rgba(239,68,68,0.5)] flex items-center justify-center text-[8px] font-black text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card w-80 md:w-96 border-white/10 p-0 rounded-3xl mt-4 overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-4 bg-white/5 border-b border-white/5 flex items-center justify-between">
                    <div>
                        <DropdownMenuLabel className="p-0 text-sm font-black text-white">Notifications</DropdownMenuLabel>
                        <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-0.5">
                            {unreadCount} Unread Activities
                        </p>
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                markReadMutation.mutate();
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:text-indigo-300 transition-colors"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                            <div className="h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                                <Bell className="text-white/10" size={24} />
                            </div>
                            <p className="text-sm font-black text-white/20 uppercase tracking-widest">Everything&apos;s quiet</p>
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <DropdownMenuItem
                                key={n._id}
                                onClick={() => handleNotificationClick(n)}
                                className={cn(
                                    "flex items-start gap-4 p-4 cursor-pointer transition-colors border-b border-white/[0.02] last:border-0 focus:bg-white/5",
                                    !n.read && "bg-indigo-500/[0.03]"
                                )}
                            >
                                <div className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border border-white/5 shadow-inner",
                                    !n.read ? "bg-indigo-500/10" : "bg-white/5"
                                )}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 space-y-1 min-w-0">
                                    <p className={cn(
                                        "text-xs leading-relaxed",
                                        !n.read ? "text-white font-bold" : "text-[var(--text-secondary)] font-medium"
                                    )}>
                                        {getNotificationMessage(n.type, n.project?.title || 'a project')}
                                    </p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] text-[var(--text-muted)] font-medium">
                                            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                        </p>
                                        {!n.read && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full shadow-[0_0_8px_var(--accent)]" />}
                                    </div>
                                </div>
                            </DropdownMenuItem>
                        ))
                    )}
                </div>

                {notifications.length > 0 && (
                    <div className="p-3 bg-white/[0.02] text-center border-t border-white/5">
                        <button
                            className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] hover:text-white transition-colors py-1 flex items-center justify-center gap-2 mx-auto"
                            onClick={() => {
                                router.push('/dashboard/settings');
                                setIsOpen(false);
                            }}
                        >
                            <Settings size={12} />
                            Notification Settings
                        </button>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Add these to globals.css if not present
// @keyframes bell-shake {
//   0%, 100% { transform: rotate(0); }
//   25% { transform: rotate(10deg); }
//   75% { transform: rotate(-10deg); }
// }
