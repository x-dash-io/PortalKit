import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { FileQuestion, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg-base)]">
            <GlassCard className="max-w-md w-full p-8 text-center space-y-6">
                <div className="mx-auto w-16 h-16 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                    <FileQuestion className="w-8 h-8 text-[var(--accent)]" />
                </div>

                <div className="space-y-2">
                    <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
                    <p className="text-[var(--text-secondary)]">
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                </div>

                <Link href="/" className="w-full">
                    <GlassButton
                        variant="primary"
                        className="w-full"
                        icon={<Home className="w-4 h-4" />}
                    >
                        Back to Home
                    </GlassButton>
                </Link>
            </GlassCard>
        </div>
    );
}
