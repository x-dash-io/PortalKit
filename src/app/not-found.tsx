import { FileQuestion, Home } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'var(--canvas)' }}>
      <div
        className="max-w-md w-full p-8 text-center rounded-2xl"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-modal)' }}
      >
        <div
          className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          style={{ background: 'var(--accent-light)' }}
        >
          <FileQuestion size={28} style={{ color: 'var(--accent)' }} />
        </div>

        <h1 className="text-2xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>
          Page not found
        </h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>

        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all"
          style={{ background: 'var(--accent)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow-sm)' }}
        >
          <Home size={15} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
