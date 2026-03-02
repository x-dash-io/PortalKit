'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PortalOverviewProps {
    project: any;
}

export function PortalOverview({ project }: PortalOverviewProps) {
    const totalMilestones = project.milestones?.length || 0;
    const completedMilestones = project.milestones?.filter((m: any) => m.status === 'complete').length || 0;
    const progressPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    return (
        <section className="space-y-8">
            <div className="glass-card p-8 rounded-3xl border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                        {project.status === 'active' ? 'Active Project' : project.status}
                    </Badge>
                </div>

                <div className="max-w-2xl space-y-4">
                    <h2 className="text-3xl font-black tracking-tight text-white">Project Overview</h2>
                    <p className="text-[var(--text-secondary)] leading-relaxed text-lg">
                        {project.description || "Welcome to your project portal. Here you can track progress, download files, and approve deliverables."}
                    </p>
                </div>

                <div className="mt-10 space-y-6">
                    <div className="flex items-end justify-between">
                        <div className="space-y-1">
                            <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">Current Progress</span>
                            <div className="text-4xl font-black text-white">{Math.round(progressPercent)}%</div>
                        </div>
                        <div className="text-right">
                            <span className="text-[var(--text-muted)] text-sm font-medium">
                                {completedMilestones} / {totalMilestones} Milestones Complete
                            </span>
                        </div>
                    </div>

                    <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-1">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercent}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                        />
                    </div>
                </div>
            </div>

            {project.milestones && project.milestones.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {project.milestones.slice(0, 4).map((milestone: any, i: number) => (
                        <div key={milestone._id} className="glass-card p-4 border-white/5 flex items-center gap-4">
                            <div className={cn(
                                "h-10 w-10 rounded-full flex items-center justify-center text-xs font-bold",
                                milestone.status === 'complete' ? "bg-emerald-500/10 text-emerald-400" : "bg-white/5 text-[var(--text-muted)]"
                            )}>
                                {i + 1}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold truncate text-white">{milestone.title}</div>
                                <div className="text-[10px] uppercase font-bold tracking-tighter text-[var(--text-muted)] mt-0.5">{milestone.status.replace('_', ' ')}</div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
