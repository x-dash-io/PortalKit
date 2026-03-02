'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/store/useThemeStore';
import { useSession } from 'next-auth/react';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useThemeStore();
    const { data: session } = useSession();

    // Sync theme with session if available
    useEffect(() => {
        if (session?.user?.theme) {
            setTheme(session.user.theme as any);
        }
    }, [session, setTheme]);

    // Apply theme to document
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    return <>{children}</>;
}
