'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Command, Search, ArrowRight, FolderKanban, LayoutDashboard,
  Settings, Plus, FileText, CheckCircle2, Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  group: string;
  keywords?: string[];
}

interface CommandPaletteProps {
  onNewProject?: () => void;
}

export function CommandPalette({ onNewProject }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    {
      id: 'dashboard',
      label: 'Go to Dashboard',
      icon: <LayoutDashboard size={15} />,
      action: () => router.push('/dashboard'),
      group: 'Navigate',
      keywords: ['home', 'overview'],
    },
    {
      id: 'projects',
      label: 'View all Projects',
      icon: <FolderKanban size={15} />,
      action: () => router.push('/dashboard/projects'),
      group: 'Navigate',
      keywords: ['workspaces'],
    },
    {
      id: 'settings',
      label: 'Open Settings',
      icon: <Settings size={15} />,
      action: () => router.push('/dashboard/settings'),
      group: 'Navigate',
      keywords: ['preferences', 'profile'],
    },
    {
      id: 'settings-profile',
      label: 'Edit Profile',
      icon: <Settings size={15} />,
      action: () => router.push('/dashboard/settings/profile'),
      group: 'Navigate',
    },
    {
      id: 'settings-billing',
      label: 'Billing & Plan',
      icon: <FileText size={15} />,
      action: () => router.push('/dashboard/settings/billing'),
      group: 'Navigate',
    },
    {
      id: 'new-project',
      label: 'Create new Project',
      description: 'Start a new client workspace',
      icon: <Plus size={15} />,
      action: () => { setOpen(false); onNewProject?.(); },
      group: 'Actions',
      keywords: ['add', 'create'],
    },
    {
      id: 'notifications',
      label: 'View Notifications',
      icon: <CheckCircle2 size={15} />,
      action: () => router.push('/dashboard/notifications'),
      group: 'Navigate',
    },
  ];

  const filtered = query.trim()
    ? commands.filter((c) => {
        const q = query.toLowerCase();
        return (
          c.label.toLowerCase().includes(q) ||
          c.description?.toLowerCase().includes(q) ||
          c.keywords?.some((k) => k.includes(q))
        );
      })
    : commands;

  const grouped = filtered.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});

  const flatFiltered = Object.values(grouped).flat();

  const runItem = useCallback(
    (item: CommandItem) => {
      item.action();
      setOpen(false);
      setQuery('');
    },
    []
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((v) => !v);
        setSelected(0);
        setQuery('');
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    setSelected(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected((s) => Math.min(s + 1, flatFiltered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected((s) => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      const item = flatFiltered[selected];
      if (item) runItem(item);
    }
  };

  if (!open) return null;

  let itemIndex = 0;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-start justify-center pt-[15vh]"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={() => setOpen(false)}
    >
      <div
        className="w-full max-w-lg mx-4 rounded-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-modal)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div
          className="flex items-center gap-3 px-4 py-3"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: 'var(--text-primary)' }}
          />
          <div
            className="hidden items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-bold uppercase tracking-widest sm:flex"
            style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
          >
            <Command size={10} />K
          </div>
        </div>

        {/* Results */}
        <div className="max-h-[340px] overflow-y-auto p-2">
          {flatFiltered.length === 0 ? (
            <div className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group} className="mb-2">
                <p
                  className="mb-1 px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {group}
                </p>
                {items.map((item) => {
                  const idx = itemIndex++;
                  const isSelected = idx === selected;
                  return (
                    <button
                      key={item.id}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors'
                      )}
                      style={{
                        background: isSelected ? 'var(--accent-light)' : 'transparent',
                        color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                      }}
                      onClick={() => runItem(item)}
                      onMouseEnter={() => setSelected(idx)}
                    >
                      <span style={{ color: isSelected ? 'var(--accent)' : 'var(--text-muted)' }}>
                        {item.icon}
                      </span>
                      <span className="flex-1 font-medium">{item.label}</span>
                      {item.description && (
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                          {item.description}
                        </span>
                      )}
                      {isSelected && <ArrowRight size={13} style={{ color: 'var(--accent)' }} />}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-4 py-2 text-[10px] font-semibold"
          style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}
        >
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1"><Zap size={10} /> PortalKit</span>
          </div>
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        </div>
      </div>
    </div>
  );
}
