'use client';

import Link from 'next/link';
import { ArrowUpRight, CheckCircle, FileText, Folder, UserRound } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassBadge } from '@/components/glass/GlassBadge';

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

  const statusVariant =
    project.status === 'completed' ? 'emerald' : project.status === 'archived' ? 'slate' : 'indigo';

  return (
    <Link href={`/dashboard/projects/${project._id}`}>
      <GlassCard className="group h-full rounded-[2rem] p-6" hoverable>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <GlassBadge variant={statusVariant}>{project.status}</GlassBadge>
            <div>
              <h3 className="line-clamp-1 text-xl font-semibold tracking-tight text-[var(--text-primary)] group-hover:text-[var(--accent)]">
                {project.title}
              </h3>
              <div className="mt-2 flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                <UserRound size={14} />
                <span>{project.clientName}</span>
              </div>
            </div>
          </div>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-secondary)] transition-colors group-hover:text-[var(--accent)]">
            <ArrowUpRight size={18} />
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          <MetricChip icon={Folder} value={project.filesCount || 0} label="Files" />
          <MetricChip icon={FileText} value={project.invoicesCount || 0} label="Invoices" />
          <MetricChip icon={CheckCircle} value={project.approvalsCount || 0} label="Approvals" />
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-[var(--border-subtle)] pt-4 text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
          <span className="font-mono">{project._id.slice(0, 8)}</span>
          <span>Updated {lastUpdated}</span>
        </div>
      </GlassCard>
    </Link>
  );
}

function MetricChip({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Folder;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-3">
      <div className="flex items-center gap-2 text-[var(--text-secondary)]">
        <Icon size={14} />
        <span className="text-[11px] font-medium uppercase tracking-[0.18em]">{label}</span>
      </div>
      <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
