'use client';

import { useDeferredValue, useState } from 'react';
import { FolderKanban, Search } from 'lucide-react';
import type { ProjectSummary } from '@/lib/contracts';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { NewProjectModal } from '@/components/dashboard/NewProjectModal';
import { GlassInput } from '@/components/glass/GlassInput';
import { cn } from '@/lib/utils';

export function ProjectsIndexClient({
  projects,
  initialQuery = '',
  initialStatus = 'all',
}: {
  projects: ProjectSummary[];
  initialQuery?: string;
  initialStatus?: 'all' | ProjectSummary['status'];
}) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<'all' | ProjectSummary['status']>(initialStatus);
  const deferredQuery = useDeferredValue(query);

  const filteredProjects = projects.filter((project) => {
    const matchesStatus = status === 'all' || project.status === status;
    const matchesQuery =
      deferredQuery.trim().length === 0 ||
      project.title.toLowerCase().includes(deferredQuery.toLowerCase()) ||
      project.clientName.toLowerCase().includes(deferredQuery.toLowerCase()) ||
      project.clientEmail.toLowerCase().includes(deferredQuery.toLowerCase());

    return matchesStatus && matchesQuery;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Delivery workspaces</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Projects</h1>
          <p className="text-sm text-[var(--text-secondary)]">Search, filter, and open every active client workspace from one index.</p>
        </div>
        <NewProjectModal />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto]">
        <GlassInput
          placeholder="Search by title, client, or email..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          icon={<Search size={18} />}
        />
        <div className="flex flex-wrap items-center gap-2 rounded-3xl border border-[var(--border-subtle)] bg-[var(--surface)] p-1.5 shadow-[var(--shadow-soft)]">
          {[
            { value: 'all', label: 'All' },
            { value: 'active', label: 'Active' },
            { value: 'completed', label: 'Completed' },
            { value: 'archived', label: 'Archived' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setStatus(option.value as 'all' | ProjectSummary['status'])}
              className={cn(
                'h-11 rounded-2xl px-4 text-sm font-medium transition-colors',
                status === option.value
                  ? 'bg-[var(--accent-light)] text-[var(--accent)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--muted)]'
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="glass-card rounded-[2rem] border border-dashed border-[var(--border-subtle)] bg-transparent p-16 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-[var(--surface)] text-[var(--text-muted)]">
            <FolderKanban size={34} />
          </div>
          <h2 className="mt-6 text-xl font-semibold text-[var(--text-primary)]">No matching projects</h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
            Adjust the filters or create a new workspace to launch another client portal.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project) => (
            <ProjectCard key={project._id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
