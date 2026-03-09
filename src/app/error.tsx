'use client';

import { useEffect } from 'react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-base)]">
            <GlassCard className="max-w-md w-full p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Something went wrong</h1>
                    <p className="text-[var(--text-secondary)]">
                        An unexpected error occurred. We&apos;ve been notified and are looking into it.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <GlassButton
                        onClick={() => reset()}
                        variant="primary"
                        icon={<RefreshCcw className="w-4 h-4" />}
                    >
                        Try again
                    </GlassButton>
                    <Link href="/" className="w-full">
                        <GlassButton
                            variant="secondary"
                            className="w-full"
                            icon={<Home className="w-4 h-4" />}
                        >
                            Back to Home
                        </GlassButton>
                    </Link>
                </div>
            </GlassCard>
        </div>
    );
}
