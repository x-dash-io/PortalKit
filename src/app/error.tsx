'use client';

import { useEffect } from 'react';
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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--canvas)' }}>
      <div
        className="max-w-md w-full p-8 text-center rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-modal)' }}
      >
        <div
          className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'var(--destructive-bg)' }}
        >
          <AlertTriangle size={28} style={{ color: 'var(--destructive)' }} />
        </div>

        <h1 className="text-2xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
          Something went wrong
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          An unexpected error occurred. We&apos;ve been notified and are looking into it.
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all w-full"
            style={{ background: 'var(--accent)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow-sm)' }}
          >
            <RefreshCcw size={14} />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors w-full"
            style={{ background: 'var(--surface-muted)', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)' }}
          >
            <Home size={14} />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
