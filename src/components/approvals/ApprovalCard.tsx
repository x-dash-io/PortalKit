'use client';

import React, { useState } from 'react';
import {
    CheckCircle2,
    AlertCircle,
    Clock,
    FileIcon,
    ChevronDown,
    Check,
    RotateCcw,
    Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { CommentThread } from './CommentThread';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import type { ApprovalRecord } from '@/lib/contracts';

// Glass Components
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
                body: JSON.stringify({ status })
            });

            if (!res.ok) throw new Error('Response failed');
            toast.success(status === 'approved' ? 'Approved!' : 'Changes requested');
            onRefresh();
        } catch (error) {
            toast.error('Could not submit response');
        } finally {
            setResponseLoading(null);
        }
    };

    const statusConfig = {
        pending: { label: 'Pending Review', variant: 'amber' as const, icon: Clock },
        approved: { label: 'Approved', variant: 'emerald' as const, icon: CheckCircle2 },
        changes_requested: { label: 'Changes Requested', variant: 'red' as const, icon: AlertCircle }
    };

    const config = statusConfig[approval.status as keyof typeof statusConfig] || statusConfig.pending;

    return (
        <GlassCard
            className={cn(
                "p-0 transition-all duration-500 overflow-hidden border-white/5",
                isExpanded ? "ring-2 ring-indigo-500/20" : "hover:border-white/10"
            )}
        >
            <div
                className="p-6 flex items-center justify-between cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-6">
                    <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center transition-all duration-500 bg-white/5",
                        isExpanded ? "scale-110 bg-indigo-500/10 text-indigo-400" : "group-hover:bg-white/10"
                    )}>
                        <config.icon size={28} />
                    </div>
                    <div>
                        <h4 className="font-black text-xl text-white tracking-tight">{approval.title}</h4>
                        <div className="flex items-center gap-4 mt-1.5">
                            <GlassBadge variant="slate" className="text-[10px] bg-white/5">
                                {approval.type}
                            </GlassBadge>
                            <span className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)]">
                                {format(new Date(approval.createdAt), 'MMM dd')}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <GlassBadge variant={config.variant} className="px-4 py-1.5">
                        {config.label}
                    </GlassBadge>
                    <div className={cn(
                        "text-[var(--text-muted)] p-2 rounded-xl transition-transform duration-500",
                        isExpanded ? "rotate-180 bg-white/5 text-white" : "group-hover:text-white"
                    )}>
                        <ChevronDown size={22} />
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                    >
                        <div className="px-8 pb-8 pt-6 border-t border-white/5">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    {approval.description && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Context & Requirements</label>
                                            <p className="text-base leading-relaxed text-[var(--text-secondary)] font-medium">{approval.description}</p>
                                        </div>
                                    )}

                                    {approval.file && (
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">Attached Artifact</label>
                                            <div className="flex items-center justify-between p-4 glass-card bg-white/[0.02] border-white/5 rounded-2xl group/file">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                                        <FileIcon size={20} />
                                                    </div>
                                                    <span className="text-sm font-bold text-white">
                                                        {approval.file.originalName}
                                                    </span>
                                                </div>
                                                <GlassButton variant="ghost" size="sm" className="rounded-xl h-9">
                                                    View Asset
                                                </GlassButton>
                                            </div>
                                        </div>
                                    )}

                                    {view === 'client' && approval.status === 'pending' && (
                                        <div className="flex gap-4 pt-4">
                                            <GlassButton
                                                onClick={() => handleResponse('approved')}
                                                disabled={!!responseLoading}
                                                className="flex-1 rounded-2xl h-14"
                                            >
                                                {responseLoading === 'approved' ? <Loader2 className="animate-spin" /> : <><Check size={20} className="mr-2" /> Approve Design</>}
                                            </GlassButton>
                                            <GlassButton
                                                variant="secondary"
                                                onClick={() => handleResponse('changes_requested')}
                                                disabled={!!responseLoading}
                                                className="flex-1 rounded-2xl h-14 border-red-500/20 text-red-500 hover:bg-red-500/10"
                                            >
                                                {responseLoading === 'changes_requested' ? <Loader2 className="animate-spin" /> : <><RotateCcw size={20} className="mr-2" /> Request Revision</>}
                                            </GlassButton>
                                        </div>
                                    )}

                                    {view === 'freelancer' && approval.status === 'changes_requested' && (
                                        <div className="pt-4">
                                            <GlassButton className="w-full rounded-2xl h-14">
                                                <RotateCcw size={20} className="mr-2" /> Submit Revisions
                                            </GlassButton>
                                        </div>
                                    )}
                                </div>

                                <div className="lg:border-l lg:border-white/5 lg:pl-12">
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
