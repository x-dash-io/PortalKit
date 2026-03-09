import Link from 'next/link';
import { ArrowUpRight, Bell, FolderKanban, ReceiptText, ShieldCheck } from 'lucide-react';

const highlights = [
  {
    title: 'Project control',
    description: 'Run milestones, approvals, files, and billing from one operating layer.',
    icon: FolderKanban,
  },
  {
    title: 'Client-safe delivery',
    description: 'Share only the portal surfaces your client needs to see.',
    icon: ShieldCheck,
  },
  {
    title: 'Finance visibility',
    description: 'Track invoice send, view, and paid states without leaving the project.',
    icon: ReceiptText,
  },
];

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#06131b_0%,#0b1f2a_18%,#e9eef0_18%,#edf3f6_100%)]">
      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[minmax(0,1.08fr)_minmax(460px,560px)]">
        <section className="relative overflow-hidden px-6 py-8 text-white lg:px-10 lg:py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(34,197,94,0.18),transparent_22%),radial-gradient(circle_at_80%_10%,rgba(34,211,238,0.18),transparent_18%),linear-gradient(180deg,rgba(6,19,27,0.94),rgba(6,19,27,0.74))]" />
          <div className="relative flex h-full flex-col rounded-[2.75rem] border border-white/10 bg-white/[0.05] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.28)] backdrop-blur-xl lg:p-12">
            <div className="flex items-center justify-between gap-4">
              <Link href="/" className="inline-flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-[#0f766e] shadow-[0_20px_50px_rgba(255,255,255,0.14)]">
                  <ShieldCheck size={20} />
                </span>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/65">PortalKit</p>
                  <p className="text-xs text-white/55">Enterprise client operations</p>
                </div>
              </Link>

              <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white/65 md:flex">
                <Bell size={12} />
                High-signal workspace
              </div>
            </div>

            <div className="mt-16 max-w-3xl space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
                <ArrowUpRight size={14} />
                Freelancer to enterprise-grade delivery
              </div>

              <div className="space-y-5">
                <h1 className="max-w-4xl text-5xl font-semibold leading-[0.96] tracking-[-0.05em] text-white md:text-7xl">
                  Replace scattered client ops with one credible system.
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-white/72">
                  PortalKit gives freelancers and studios a structured workspace for delivery, approvals, billing,
                  notifications, and secure client visibility.
                </p>
              </div>
            </div>

            <div className="mt-auto grid gap-4 pt-12 md:grid-cols-3">
              {highlights.map((item) => (
                <div key={item.title} className="rounded-[1.75rem] border border-white/10 bg-white/[0.06] p-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-[#7dd3fc]">
                    <item.icon size={18} />
                  </div>
                  <h2 className="mt-5 text-lg font-medium text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 lg:px-10 lg:py-14">
          <div className="w-full max-w-xl">{children}</div>
        </section>
      </div>
    </div>
  );
}
