'use client';

import Link from 'next/link';
import { ArrowUpRight, CheckCircle, FileText, Folder, UserRound, Clock } from 'lucide-react';

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

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  active:    { label: 'Active',    color: 'var(--status-active)',    bg: 'var(--status-active-bg)' },
  completed: { label: 'Completed', color: 'var(--status-completed)', bg: 'var(--status-completed-bg)' },
  archived:  { label: 'Archived',  color: 'var(--status-archived)',  bg: 'var(--status-archived-bg)' },
};

export function ProjectCard({ project }: ProjectCardProps) {
  const lastUpdated = new Date(project.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const status = statusConfig[project.status] ?? statusConfig.active;
  const initials = project.title
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link href={`/dashboard/projects/${project._id}`} className="block h-full group">
      <div
        className="glass-card card-interactive h-full rounded-2xl p-5 flex flex-col"
        style={{ minHeight: 180 }}
      >
        {/* Top row */}
        <div className="flex items-start justify-between gap-3 mb-4">
          {/* Avatar + title */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white text-sm font-black"
              style={{ background: 'var(--accent-gradient)', boxShadow: 'var(--glow-sm)' }}
            >
              {initials}
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <h3
                className="truncate text-sm font-bold leading-tight transition-colors group-hover:text-[var(--accent)]"
                style={{ color: 'var(--text-primary)' }}
              >
                {project.title}
              </h3>
              <div
                className="mt-1 flex items-center gap-1.5 text-xs"
                style={{ color: 'var(--text-muted)' }}
              >
                <UserRound size={10} />
                <span className="truncate">{project.clientName}</span>
              </div>
            </div>
          </div>

          {/* Arrow */}
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition-all duration-150 group-hover:bg-[var(--accent)] group-hover:border-[var(--accent)] group-hover:text-white group-hover:shadow-[var(--glow-sm)]"
            style={{ borderColor: 'var(--border-medium)', color: 'var(--text-muted)' }}
          >
            <ArrowUpRight size={14} />
          </div>
        </div>

        {/* Status badge */}
        <div className="mb-4">
          <span
            className="status-badge"
            style={{ background: status.bg, color: status.color }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full pulse-dot shrink-0"
              style={{ background: status.color }}
            />
            {status.label}
          </span>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-2 mt-auto">
          <MetricChip icon={Folder}      value={project.filesCount    ?? 0} label="Files" />
          <MetricChip icon={FileText}    value={project.invoicesCount  ?? 0} label="Invoices" />
          <MetricChip icon={CheckCircle} value={project.approvalsCount ?? 0} label="Approvals" />
        </div>

        {/* Footer */}
        <div
          className="mt-4 pt-3 flex items-center justify-between text-[10px] font-semibold"
          style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          <span className="font-mono opacity-60">{project._id.slice(-8)}</span>
          <div className="flex items-center gap-1">
            <Clock size={9} />
            <span>{lastUpdated}</span>
          </div>
        </div>
      </div>
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
    <div
      className="rounded-xl p-2.5 flex flex-col gap-1.5"
      style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}
    >
      <div className="flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
        <Icon size={10} />
        <span className="text-[9px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-base font-black leading-none" style={{ color: 'var(--text-primary)' }}>
        {value}
      </p>
    </div>
  );
}
