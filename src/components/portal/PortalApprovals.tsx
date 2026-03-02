'use client';

import React from 'react';
import { ApprovalCard } from '@/components/approvals/ApprovalCard';
import { CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface PortalApprovalsProps {
    approvals: any[];
    token: string;
    projectId: string;
}

export function PortalApprovals({ approvals, token, projectId }: PortalApprovalsProps) {
    const pending = approvals.filter(a => a.status === 'pending');
    const history = approvals.filter(a => a.status !== 'pending');

    return (
        <section className="space-y-12">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-white">Action Required</h3>
                        <p className="text-sm text-[var(--text-muted)]">Deliverables awaiting your review.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {pending.map((approval) => (
                        <div key={approval._id} className="relative">
                            <ApprovalCard
                                approval={approval}
                                projectId={projectId}
                                view="client"
                                onRefresh={() => window.location.reload()}
                            />
                        </div>
                    ))}
                    {pending.length === 0 && (
                        <div className="py-16 text-center glass-card border-dashed border-emerald-500/20 bg-emerald-500/5 rounded-3xl">
                            <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-4" />
                            <p className="text-lg font-bold text-white">You're all caught up!</p>
                            <p className="text-sm text-[var(--text-muted)]">No pending approvals at this time.</p>
                        </div>
                    )}
                </div>
            </div>

            {history.length > 0 && (
                <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-black text-white">Past Approvals</h3>
                        <p className="text-sm text-[var(--text-muted)]">History of your previous reviews.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 opacity-70 hover:opacity-100 transition-opacity">
                        {history.map((approval) => (
                            <ApprovalCard
                                key={approval._id}
                                approval={approval}
                                projectId={projectId}
                                view="client"
                                onRefresh={() => window.location.reload()}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
