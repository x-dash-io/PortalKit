'use client';

import React from 'react';
import { ApprovalCard } from '@/components/approvals/ApprovalCard';
import { CheckCircle2 } from 'lucide-react';
import type { ApprovalRecord } from '@/lib/contracts';

interface PortalApprovalsProps {
    approvals: ApprovalRecord[];
    token: string;
    projectId: string;
}

export function PortalApprovals({ approvals, token, projectId }: PortalApprovalsProps) {
    const pending = approvals.filter(a => a.status === 'pending');
    const history = approvals.filter(a => a.status !== 'pending');

    return (
        <section className="space-y-10">
            <div className="space-y-5">
                <div>
                    <h3 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Action Required
                    </h3>
                    <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Deliverables awaiting your review.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {pending.map((approval) => (
                        <ApprovalCard
                            key={approval._id}
                            approval={approval}
                            projectId={projectId}
                            view="client"
                            onRefresh={() => window.location.reload()}
                            portalToken={token}
                        />
                    ))}
                    {pending.length === 0 && (
                        <div
                            className="py-16 text-center rounded-2xl border-dashed"
                            style={{ background: 'var(--success-bg)', borderColor: 'var(--success)', border: '1px dashed var(--success)' }}
                        >
                            <CheckCircle2 size={28} className="mx-auto mb-3" style={{ color: 'var(--success)' }} />
                            <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                                You&apos;re all caught up!
                            </p>
                            <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                                No pending approvals at this time.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {history.length > 0 && (
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Past Approvals</h3>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>History of your previous reviews.</p>
                    </div>
                    <div className="grid grid-cols-1 gap-4 opacity-70 hover:opacity-100 transition-opacity">
                        {history.map((approval) => (
                            <ApprovalCard
                                key={approval._id}
                                approval={approval}
                                projectId={projectId}
                                view="client"
                                onRefresh={() => window.location.reload()}
                                portalToken={token}
                            />
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
