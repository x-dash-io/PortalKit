'use client';

import { useDeferredValue, useState, useRef, useCallback } from 'react';
import { FolderKanban, Search, X, SlidersHorizontal, Plus } from 'lucide-react';
import type { ProjectSummary } from '@/lib/contracts';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { NewProjectModal } from '@/components/dashboard/NewProjectModal';
import { cn } from '@/lib/utils';

const STATUS_OPTIONS = [
  { value: 'all',       label: 'All'       },
  { value: 'active',    label: 'Active'    },
  { value: 'completed', label: 'Completed' },
  { value: 'archived',  label: 'Archived'  },
] as const;

export function ProjectsIndexClient({
  projects,
  initialQuery  = '',
  initialStatus = 'all',
}: {
  projects: ProjectSummary[];
  initialQuery?: string;
  initialStatus?: 'all' | ProjectSummary['status'];
}) {
  const [query,  setQuery]  = useState(initialQuery);
  const [status, setStatus] = useState<'all' | ProjectSummary['status']>(initialStatus);
  const [searchFocused, setSearchFocused] = useState(false);
  const deferredQuery = useDeferredValue(query);
  const inputRef = useRef<HTMLInputElement>(null);

  const isFiltered = query.length > 0 || status !== 'all';
  const isStale    = query !== deferredQuery;

  const filteredProjects = projects.filter((p) => {
    const matchesStatus = status === 'all' || p.status === status;
    const q = deferredQuery.trim().toLowerCase();
    const matchesQuery =
      q.length === 0 ||
      p.title.toLowerCase().includes(q) ||
      p.clientName.toLowerCase().includes(q) ||
      p.clientEmail.toLowerCase().includes(q);
    return matchesStatus && matchesQuery;
  });

  const clearAll   = useCallback(() => { setQuery(''); setStatus('all'); inputRef.current?.focus(); }, []);
  const clearQuery = useCallback(() => { setQuery(''); inputRef.current?.focus(); }, []);

  return (
    <div className="space-y-6 animate-fade-up">
      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
            Delivery workspaces
          </p>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Projects
          </h1>
          <p
            className="text-sm mt-0.5 transition-opacity duration-150"
            style={{ color: 'var(--text-secondary)', opacity: isStale ? 0.4 : 1 }}
          >
            {filteredProjects.length} of {projects.length} workspace{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        <NewProjectModal />
      </div>

      {/* ── Search + Filter bar ── */}
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center">
        {/* Search */}
        <div
          className="flex flex-1 items-center gap-2.5 rounded-xl px-3.5 py-2.5 transition-all duration-150"
          style={{
            background: 'var(--surface)',
            border: `1px solid ${searchFocused ? 'var(--accent)' : 'var(--border-medium)'}`,
            boxShadow: searchFocused ? 'var(--glow-accent)' : 'var(--shadow-xs)',
          }}
        >
          <Search
            size={14}
            style={{
              color: searchFocused ? 'var(--accent)' : 'var(--text-muted)',
              flexShrink: 0,
              transition: 'color 0.15s',
            }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by project, client name, or email…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onKeyDown={(e) => e.key === 'Escape' && clearQuery()}
            className="flex-1 bg-transparent text-sm outline-none min-w-0"
            style={{ color: 'var(--text-primary)' }}
          />

          {/* Spinner while deferred */}
          {isStale && (
            <div
              className="h-3.5 w-3.5 rounded-full border-2 shrink-0"
              style={{
                borderColor: 'var(--accent)',
                borderTopColor: 'transparent',
                animation: 'spin 0.6s linear infinite',
              }}
            />
          )}

          {/* Clear query button */}
          {query && !isStale && (
            <button
              onClick={clearQuery}
              className="flex h-5 w-5 items-center justify-center rounded-md transition-colors hover:bg-[var(--accent-light)] shrink-0"
              style={{ color: 'var(--text-muted)' }}
              aria-label="Clear search"
            >
              <X size={11} />
            </button>
          )}
        </div>

        {/* Status filter pills */}
        <div
          className="flex items-center gap-1 rounded-xl p-1 shrink-0"
          style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}
        >
          <SlidersHorizontal size={11} className="ml-1.5 shrink-0" style={{ color: 'var(--text-muted)' }} />
          {STATUS_OPTIONS.map((option) => {
            const active = status === option.value;
            return (
              <button
                key={option.value}
                onClick={() => setStatus(option.value as typeof status)}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all duration-150',
                  !active && 'hover:bg-[var(--accent-light)]'
                )}
                style={{
                  background:  active ? 'var(--accent)' : undefined,
                  color:       active ? 'var(--primary-foreground)' : 'var(--text-secondary)',
                  boxShadow:   active ? 'var(--glow-sm)' : undefined,
                }}
              >
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Clear all */}
        {isFiltered && !isStale && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-150 hover:bg-[var(--destructive-bg)] shrink-0"
            style={{
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-medium)',
              background: 'var(--surface)',
            }}
          >
            <X size={11} />
            Clear
          </button>
        )}
      </div>

      {/* ── Results ── */}
      {filteredProjects.length === 0 ? (
        <div
          className="rounded-2xl border-2 border-dashed p-16 text-center animate-fade-up"
          style={{ borderColor: 'var(--border-medium)' }}
        >
          <div
            className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl mb-4"
            style={{ background: 'var(--surface-muted)' }}
          >
            <FolderKanban size={26} style={{ color: 'var(--text-muted)' }} />
          </div>
          <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            {isFiltered ? 'No matching projects' : 'No projects yet'}
          </h2>
          <p className="text-sm max-w-xs mx-auto mb-5" style={{ color: 'var(--text-secondary)' }}>
            {isFiltered
              ? 'Try adjusting your search or filters.'
              : 'Create your first project to get started.'}
          </p>
          {isFiltered ? (
            <button
              onClick={clearAll}
              className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              <X size={13} />
              Clear filters
            </button>
          ) : (
            <NewProjectModal />
          )}
        </div>
      ) : (
        <div
          className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3"
          style={{ opacity: isStale ? 0.55 : 1, transition: 'opacity 0.15s ease' }}
        >
          {filteredProjects.map((project, i) => (
            <div
              key={project._id}
              className="animate-fade-up"
              style={{ animationDelay: `${i * 35}ms` }}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
