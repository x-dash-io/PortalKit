'use client';

import React, { useEffect } from 'react';
import { useThemeStore } from '@/lib/store/themeStore';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function ThemeSwitcher() {
    const { theme, setTheme } = useThemeStore();

    useEffect(() => {
        document.documentElement.dataset.theme = theme;
    }, [theme]);

    const themes = [
        { id: 'frost', label: 'Frost', class: 'bg-white border-slate-200' },
        { id: 'obsidian', label: 'Obsidian', class: 'bg-slate-900 border-slate-700' },
        { id: 'aurora', label: 'Aurora', class: 'bg-fuchsia-600 border-fuchsia-400' },
    ] as const;

    const handleSetTheme = async (newTheme: 'frost' | 'obsidian' | 'aurora') => {
        setTheme(newTheme);
        // Optionally PATCH /api/user/settings if user is logged in
        try {
            await fetch('/api/user/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ theme: newTheme }),
            });
        } catch (e) { }
    };

    return (
        <div className="flex items-center gap-3 bg-[var(--bg-surface)] p-2 rounded-2xl border border-[var(--border-subtle)] w-fit">
            {themes.map((t) => (
                <button
                    key={t.id}
                    onClick={() => handleSetTheme(t.id)}
                    className="relative group"
                    title={t.label}
                >
                    <motion.div
                        animate={{
                            scale: theme === t.id ? 1.15 : 1,
                            boxShadow: theme === t.id ? '0 0 15px var(--glow)' : 'none',
                        }}
                        className={cn(
                            "h-6 w-6 rounded-full border-2 transition-transform",
                            t.class,
                            theme === t.id ? "border-[var(--accent)]" : "border-transparent"
                        )}
                    />
                    {theme === t.id && (
                        <motion.div
                            layoutId="theme-active"
                            className="absolute -inset-1 rounded-full border border-[var(--accent)] opacity-50"
                        />
                    )}
                </button>
            ))}
        </div>
    );
}
