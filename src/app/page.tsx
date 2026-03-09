import Link from 'next/link';
import {
  ArrowRight,
  Bell,
  CheckCircle2,
  CreditCard,
  Files,
  FolderKanban,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const pillars = [
  {
    icon: FolderKanban,
    title: 'Project control',
    description: 'Track milestones, keep context in one place, and stop losing work inside message threads.',
  },
  {
    icon: Files,
    title: 'Asset delivery',
    description: 'Share files, manage versions, and expose only the client-safe surfaces you actually want visible.',
  },
  {
    icon: CheckCircle2,
    title: 'Approvals',
    description: 'Capture approvals and revision requests against specific deliverables with a clear audit trail.',
  },
  {
    icon: CreditCard,
    title: 'Invoices',
    description: 'Create invoices, monitor views, follow overdue balances, and keep billing tied to the project.',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Get signal when clients act instead of polling inboxes, docs, and shared drives all day.',
  },
  {
    icon: ShieldCheck,
    title: 'Client portal',
    description: 'Present a secure, branded project portal that feels more like product than a shared folder.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--bg-base)]">
      <section className="mx-auto max-w-7xl px-6 py-8">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.03] px-6 py-5 shadow-[var(--shadow-soft)] md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent)] text-white shadow-[var(--glow)]">
              <ShieldCheck size={20} />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">PortalKit</p>
              <p className="text-sm text-[var(--text-secondary)]">Enterprise-grade client portal operations for independent teams.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="ghost">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="rounded-xl px-5">
              <Link href="/auth/signup">
                Start Free
                <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </header>

        <div className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,440px)] lg:items-center">
          <div className="space-y-8">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-secondary)]">
              <Sparkles size={14} />
              Crisp enterprise operations
            </p>

            <div className="space-y-5">
              <h1 className="max-w-4xl text-5xl font-black leading-[1.02] text-[var(--text-primary)] md:text-7xl">
                Replace scattered client ops with one serious delivery system.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
                PortalKit gives freelancers and studios one place to run projects, deliver files, collect approvals,
                send invoices, and keep clients aligned without duct-taping generic tools together.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="rounded-2xl px-6">
                <Link href="/auth/signup">
                  Create Workspace
                  <ArrowRight size={18} />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="rounded-2xl px-6">
                <Link href="/dashboard">Open Dashboard</Link>
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                { label: 'Client-facing portal', value: 'Secure by default' },
                { label: 'Delivery workflow', value: 'Files, approvals, invoices' },
                { label: 'Designed for', value: 'Freelancers and studios' },
              ].map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[var(--text-muted)]">{item.label}</p>
                  <p className="mt-3 text-lg font-semibold text-[var(--text-primary)]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <Card className="rounded-[2rem] border-white/10 bg-white/[0.05] shadow-[var(--shadow-soft)]">
            <CardHeader>
              <CardTitle className="text-xl font-black">PortalKit workflow</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                'Create a project and invite the client to a dedicated portal',
                'Upload files, request approvals, and keep revision threads attached to deliverables',
                'Issue invoices, track views, and follow up on overdue balances',
                'Use notifications and settings to keep the workspace high-signal',
              ].map((step, index) => (
                <div key={step} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-light)] font-mono text-sm font-semibold text-[var(--accent)]">
                    0{index + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{step}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <section className="mt-20 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="rounded-[1.75rem] border-white/10 bg-white/[0.04] shadow-none">
              <CardHeader>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-light)] text-[var(--accent)]">
                  <pillar.icon size={22} />
                </div>
                <CardTitle className="mt-6 text-2xl font-black">{pillar.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-[var(--text-secondary)]">{pillar.description}</CardContent>
            </Card>
          ))}
        </section>
      </section>
    </main>
  );
}
