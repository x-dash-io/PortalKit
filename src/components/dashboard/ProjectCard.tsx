'use client';

import { motion } from 'framer-motion';
import { Folder, FileText, CheckCircle, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassBadge } from '@/components/glass/GlassBadge';
import Link from 'next/link';

interface ProjectCardProps {
    project: {
        _id: string;
        title: string;
        clientName: string;
        status: string;
        updatedAt: string;
        filesCount?: number;
        invoicesCount?: number;
        approvalsCount?: number;
    };
}

export function ProjectCard({ project }: ProjectCardProps) {
    const lastUpdated = new Date(project.updatedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
    });

    return (
        <Link href={`/dashboard/projects/${project._id}`}>
            <GlassCard className="h-full flex flex-col group p-8">
                <div className="flex items-start justify-between mb-8">
                    <div className="space-y-2">
                        <GlassBadge variant={project.status === 'active' ? 'indigo' : 'emerald'}>
                            {project.status === 'active' ? 'Active' : 'Completed'}
                        </GlassBadge>
                        <h3 className="text-xl font-black text-white group-hover:text-[var(--accent)] transition-colors line-clamp-1">
                            {project.title}
                        </h3>
                        <p className="text-sm font-bold text-[var(--text-muted)] p-0">
                            {project.clientName}
                        </p>
                    </div>
                    <div className="p-3 bg-white/5 rounded-2xl group-hover:bg-[var(--accent-light)] group-hover:text-[var(--accent)] transition-all">
                        <ArrowUpRight size={20} />
                    </div>
                </div>

                <div className="flex-1 divider" />

                <div className="grid grid-cols-3 gap-2 mb-8">
                    <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/5">
                        <Folder size={18} className="mx-auto mb-1 text-indigo-400/80" />
                        <span className="text-xs font-black text-white">{project.filesCount || 0}</span>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/5">
                        <FileText size={18} className="mx-auto mb-1 text-emerald-400/80" />
                        <span className="text-xs font-black text-white">{project.invoicesCount || 0}</span>
                    </div>
                    <div className="text-center p-3 rounded-2xl bg-white/5 border border-white/5">
                        <CheckCircle size={18} className="mx-auto mb-1 text-amber-400/80" />
                        <span className="text-xs font-black text-white">{project.approvalsCount || 0}</span>
                    </div>
                </div>

                <div className="flex justify-between items-center text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest mt-auto pt-4 border-t border-white/5">
                    <span>ID: {project._id.substring(0, 8)}</span>
                    <span className="flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        Updated {lastUpdated}
                    </span>
                </div>
            </GlassCard>
        </Link>
    );
}
