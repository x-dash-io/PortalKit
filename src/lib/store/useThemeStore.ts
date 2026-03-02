import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'frost' | 'obsidian' | 'aurora';

interface ThemeState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'frost',
            setTheme: (theme) => {
                set({ theme });
                if (typeof document !== 'undefined') {
                    document.documentElement.dataset.theme = theme;
                }
            },
        }),
        {
            name: 'theme-storage',
        }
    )
);
