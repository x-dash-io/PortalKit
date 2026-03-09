'use client';

import { useEffect } from 'react';
import { useThemeStore } from '@/lib/store/useThemeStore';
import { useSession } from 'next-auth/react';
import { DEFAULT_THEME } from '@/lib/contracts';

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    const { theme, setTheme } = useThemeStore();
    const { data: session } = useSession();

    useEffect(() => {
        if (session?.user?.theme) {
            setTheme(session.user.theme);
        }
    }, [session, setTheme]);

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme ?? DEFAULT_THEME);
    }, [theme]);

    return <>{children}</>;
}
