'use client';

import React, { useState } from 'react';
import {
    CheckCircle2, AlertCircle, Clock, FileIcon,
    ChevronDown, Check, RotateCcw, Loader2,
} from 'lucide-react';
import { format } from 'date-fns';
import { CommentThread } from './CommentThread';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { ApprovalRecord } from '@/lib/contracts';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassButton } from '@/components/glass/GlassButton';

interface ApprovalCardProps {
    approval: ApprovalRecord;
    projectId: string;
    view: 'freelancer' | 'client';
    onRefresh: () => void;
    portalToken?: string;
}

export function ApprovalCard({ approval, projectId, view, onRefresh, portalToken }: ApprovalCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [responseLoading, setResponseLoading] = useState<string | null>(null);

    const handleResponse = async (status: 'approved' | 'changes_requested') => {
        setResponseLoading(status);
        try {
            const endpoint =
                view === 'client' && portalToken
                    ? `/api/portal/${portalToken}/approvals/${approval._id}/respond`
                    : `/api/projects/${projectId}/approvals/${approval._id}/respond`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });

            if (!res.ok) throw new Error();
            toast.success(status === 'approved' ? 'Approved!' : 'Changes requested');
            onRefresh();
        } catch {
            toast.error('Could not submit response');
        } finally {
            setResponseLoading(null);
        }
    };

    const statusConfig = {
        pending: { label: 'Pending Review', variant: 'amber' as const, icon: Clock },
        approved: { label: 'Approved', variant: 'emerald' as const, icon: CheckCircle2 },
        changes_requested: { label: 'Changes Requested', variant: 'red' as const, icon: AlertCircle },
    };

    const config = statusConfig[approval.status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <GlassCard
            className={cn(
                'p-0 transition-all duration-300 overflow-hidden',
                isExpanded && 'ring-2 ring-[var(--accent)]/20'
            )}
        >
            <div
                className="p-5 flex items-center justify-between cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-4">
                    <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center transition-all duration-300"
                        style={{
                            background: isExpanded ? 'var(--accent-light)' : 'var(--surface-muted)',
                            color: isExpanded ? 'var(--accent)' : 'var(--text-muted)',
                        }}
                    >
                        <config.icon size={22} />
                    </div>
                    <div>
                        <h4 className="font-bold text-base tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            {approval.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-1">
                            <GlassBadge variant="slate" className="text-[9px]">{approval.type}</GlassBadge>
                            <span className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                {format(new Date(approval.createdAt), 'MMM dd')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <GlassBadge variant={config.variant}>{config.label}</GlassBadge>
                    <div
                        className="p-1.5 rounded-lg transition-all duration-300"
                        style={{
                            color: 'var(--text-muted)',
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                        }}
                    >
                        <ChevronDown size={18} />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <div className="px-6 pb-6 pt-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    {approval.description && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                                Context & Requirements
                                            </label>
                                            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                                {approval.description}
                                            </p>
                                        </div>
                                    )}

                                    {approval.file && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                                Attached File
                                            </label>
                                            <div
                                                className="flex items-center justify-between p-4 rounded-xl"
                                                style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div
                                                        className="h-9 w-9 rounded-lg flex items-center justify-center"
                                                        style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                                                    >
                                                        <FileIcon size={16} />
                                                    </div>
                                                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                                                        {approval.file.originalName}
                                                    </span>
                                                </div>
                                                <GlassButton variant="ghost" size="sm" className="rounded-lg h-8 text-xs">
                                                    View
                                                </GlassButton>
                                            </div>
                                        </div>
                                    )}

                                    {view === 'client' && approval.status === 'pending' && (
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={() => void handleResponse('approved')}
                                                disabled={!!responseLoading}
                                                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
                                                style={{ background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success)' }}
                                            >
                                                {responseLoading === 'approved'
                                                    ? <Loader2 size={16} className="animate-spin" />
                                                    : <><Check size={16} /> Approve</>}
                                            </button>
                                            <button
                                                onClick={() => void handleResponse('changes_requested')}
                                                disabled={!!responseLoading}
                                                className="flex-1 flex items-center justify-center gap-2 h-11 rounded-xl font-semibold text-sm transition-all disabled:opacity-60"
                                                style={{ background: 'var(--warning-bg)', color: 'var(--warning)', border: '1px solid var(--warning)' }}
                                            >
                                                {responseLoading === 'changes_requested'
                                                    ? <Loader2 size={16} className="animate-spin" />
                                                    : <><RotateCcw size={16} /> Request Changes</>}
                                            </button>
                                        </div>
                                    )}

                                    {view === 'freelancer' && approval.status === 'changes_requested' && (
                                        <div className="pt-2">
                                            <GlassButton className="w-full h-11 rounded-xl gap-2">
                                                <RotateCcw size={16} /> Submit Revisions
                                            </GlassButton>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-6 lg:pt-0 lg:border-t-0 lg:border-l lg:pl-8" style={{ borderColor: 'var(--border-subtle)' }}>
                                    <CommentThread
                                        approvalId={approval._id}
                                        projectId={projectId}
                                        initialComments={approval.comments}
                                        currentUserType={view}
                                        portalToken={portalToken}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </GlassCard>
    );
}
