import Link from 'next/link';
import { FolderKanban, ShieldCheck, ReceiptText, Zap } from 'lucide-react';

const highlights = [
  { title: 'Project control', description: 'Run milestones, approvals, files, and billing from one operating layer.', icon: FolderKanban },
  { title: 'Client-safe delivery', description: 'Share only the portal surfaces your client needs to see.', icon: ShieldCheck },
  { title: 'Finance visibility', description: 'Track invoice send, view, and paid states without leaving the project.', icon: ReceiptText },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--canvas)' }}>
      {/* Ambient */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
        <div
          className="absolute -top-48 left-1/3 h-[500px] w-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)', filter: 'blur(100px)', opacity: 0.14 }}
        />
        <div
          className="absolute bottom-0 right-0 h-80 w-80 rounded-full"
          style={{ background: 'radial-gradient(circle, var(--accent-3) 0%, transparent 70%)', filter: 'blur(80px)', opacity: 0.08 }}
        />
        {/* Grid */}
        <svg className="absolute inset-0 w-full h-full opacity-40" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="auth-grid" width="52" height="52" patternUnits="userSpaceOnUse">
              <path d="M 52 0 L 0 0 0 52" fill="none" stroke="rgba(124,58,237,0.06)" strokeWidth="1"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#auth-grid)"/>
        </svg>
      </div>

      <div className="relative mx-auto grid min-h-screen max-w-6xl lg:grid-cols-[1fr_460px]">
        {/* ── Left hero panel ── */}
        <section className="hidden lg:flex flex-col justify-between px-10 py-12">
          <Link href="/" className="flex items-center gap-2.5">
            <span
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ background: 'var(--accent-gradient)', boxShadow: 'var(--glow-sm)' }}
            >
              <Zap size={16} strokeWidth={2.5} />
            </span>
            <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>PortalKit</span>
          </Link>

          <div className="space-y-5">
            <div
              className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid var(--border-accent)' }}
            >
              Enterprise-grade delivery
            </div>
            <h1 className="text-4xl font-black leading-tight tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Replace scattered<br />client ops with one{' '}
              <span className="gradient-text">credible system.</span>
            </h1>
            <p className="text-base leading-relaxed max-w-md" style={{ color: 'var(--text-secondary)' }}>
              PortalKit gives freelancers and studios a structured workspace for delivery,
              approvals, billing, and secure client visibility.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {highlights.map((item) => (
              <div key={item.title} className="glass-card rounded-2xl p-4">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl mb-3"
                  style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                >
                  <item.icon size={16} />
                </div>
                <h2 className="text-xs font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                  {item.title}
                </h2>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Right form panel ── */}
        <section
          className="flex items-center justify-center px-6 py-10 lg:px-8 lg:border-l"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div className="w-full max-w-sm">{children}</div>
        </section>
      </div>
    </div>
  );
}
