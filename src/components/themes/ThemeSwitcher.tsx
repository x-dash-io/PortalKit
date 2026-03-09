'use client';

import React, { useEffect, useTransition } from 'react';
import { useThemeStore } from '@/lib/store/useThemeStore';
import { cn } from '@/lib/utils';
import { type AppTheme } from '@/lib/contracts';
import { useSession } from 'next-auth/react';
import { Check } from 'lucide-react';

const themes = [
  {
    id: 'frost' as const,
    label: 'Light',
    swatch: 'linear-gradient(135deg, #f4f5fb 40%, #7c3aed 100%)',
  },
  {
    id: 'obsidian' as const,
    label: 'Dark',
    swatch: 'linear-gradient(135deg, #08080f 40%, #8b5cf6 100%)',
  },
  {
    id: 'aurora' as const,
    label: 'Aurora',
    swatch: 'linear-gradient(135deg, #160230 30%, #e879f9 100%)',
  },
] as const;

interface ThemeSwitcherProps { compact?: boolean; }

export function ThemeSwitcher({ compact = false }: ThemeSwitcherProps) {
  const { theme, setTheme } = useThemeStore();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  const handleSetTheme = async (newTheme: AppTheme) => {
    setTheme(newTheme);
    try {
      const res = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: newTheme }),
      });
      if (res.ok) startTransition(() => { void update({ user: { theme: newTheme } }); });
    } catch { /* Local theme still applied */ }
  };

  /* ── Compact (icon-only) mode ── */
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-1.5">
        {themes.map((t) => (
          <button
            key={t.id}
            onClick={() => handleSetTheme(t.id)}
            title={t.label}
            disabled={isPending}
            className={cn(
              'relative flex h-7 w-7 items-center justify-center rounded-lg transition-all duration-150 hover:scale-105',
              theme === t.id && 'ring-2 ring-offset-1 ring-[var(--accent)]'
            )}
            style={{ background: t.swatch }}
          >
            {theme === t.id && <Check size={11} className="text-white drop-shadow" strokeWidth={3} />}
          </button>
        ))}
      </div>
    );
  }

  /* ── Full mode (pill row) ── */
  return (
    <div
      className="flex items-center gap-1 rounded-xl p-1"
      style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}
    >
      {themes.map((t) => {
        const isActive = theme === t.id;
        return (
          <button
            key={t.id}
            onClick={() => handleSetTheme(t.id)}
            disabled={isPending}
            className={cn(
              'relative flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 px-2 text-xs font-semibold transition-all duration-150',
              !isActive && 'hover:bg-[var(--accent-light)]'
            )}
            style={{
              background: isActive ? 'var(--accent)' : undefined,
              color:      isActive ? 'var(--primary-foreground)' : 'var(--text-secondary)',
              boxShadow:  isActive ? 'var(--glow-sm)' : undefined,
            }}
          >
            <span
              className="h-3 w-3 rounded-full shrink-0 border border-white/20"
              style={{ background: t.swatch }}
            />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
