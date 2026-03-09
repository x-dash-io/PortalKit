'use client';

import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ProjectDetail } from '@/lib/contracts';

interface PortalOverviewProps {
  project: ProjectDetail;
}

export function PortalOverview({ project }: PortalOverviewProps) {
  const totalMilestones = project.milestones?.length || 0;
  const completedMilestones = project.milestones?.filter((milestone) => milestone.status === 'complete').length || 0;
  const progressPercent = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <section className="space-y-8">
      <div className="glass-card relative overflow-hidden rounded-[2rem] p-8">
        <div className="absolute right-8 top-8">
          <Badge className="rounded-full border-0 bg-[var(--accent-light)] px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-[var(--accent)]">
            {project.status === 'active' ? 'Active project' : project.status}
          </Badge>
        </div>

        <div className="max-w-2xl space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Project overview</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{project.title}</h2>
          <p className="text-base leading-relaxed text-[var(--text-secondary)]">
            {project.description ||
              'Welcome to your client portal. Track progress, review assets, and stay aligned on approvals and billing.'}
          </p>
        </div>

        <div className="mt-10 space-y-5">
          <div className="flex items-end justify-between gap-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Current progress</span>
              <div className="mt-2 text-4xl font-semibold tracking-tight text-[var(--text-primary)]">{Math.round(progressPercent)}%</div>
            </div>
            <span className="text-sm text-[var(--text-secondary)]">
              {completedMilestones} / {totalMilestones} milestones complete
            </span>
          </div>

          <div className="h-4 rounded-full bg-[var(--muted)] p-1">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-[var(--accent)] via-cyan-500 to-emerald-500"
            />
          </div>
        </div>
      </div>

      {project.milestones && project.milestones.length > 0 && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {project.milestones.slice(0, 4).map((milestone, index) => (
            <div key={milestone._id} className="glass-card flex items-center gap-4 rounded-[1.75rem] p-4">
              <div
                className={cn(
                  'flex h-11 w-11 items-center justify-center rounded-2xl text-sm font-semibold',
                  milestone.status === 'complete'
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-[var(--muted)] text-[var(--text-secondary)]'
                )}
              >
                {index + 1}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium text-[var(--text-primary)]">{milestone.title}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-[var(--text-muted)]">
                  {milestone.status.replace('_', ' ')}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
