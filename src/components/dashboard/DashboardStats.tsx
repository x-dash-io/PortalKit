'use client';

import { motion } from 'framer-motion';
import { FolderKanban, CheckCircle2, FileText, Share2 } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassBadge } from '@/components/glass/GlassBadge';

const stats = [
    { label: 'Active Projects', value: '12', icon: FolderKanban, variant: 'indigo' as const, badge: 'Overview' },
    { label: 'Pending Approvals', value: '05', icon: CheckCircle2, variant: 'amber' as const, badge: 'Pending' },
    { label: 'Unpaid Invoices', value: '$4,250', icon: FileText, variant: 'emerald' as const, badge: 'Finance' },
    { label: 'Files Shared', value: '128', icon: Share2, variant: 'slate' as const, badge: 'Sharing' },
];

export function DashboardStats() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
                <GlassCard
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="flex flex-col justify-between min-h-[160px]"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div className={`p-3 rounded-2xl bg-${stat.variant}-500/10 text-${stat.variant}-400`}>
                            <stat.icon size={24} />
                        </div>
                        <GlassBadge variant={stat.variant}>{stat.badge}</GlassBadge>
                    </div>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                            {stat.label}
                        </p>
                        <h3 className="text-3xl font-black text-white">
                            {stat.value}
                        </h3>
                    </div>
                </GlassCard>
            ))}
        </div>
    );
}
