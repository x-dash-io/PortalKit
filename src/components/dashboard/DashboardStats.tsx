import { FolderKanban, CheckCircle2, FileText, Share2 } from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassBadge } from '@/components/glass/GlassBadge';

const toneMap = {
  indigo: 'bg-[var(--accent-light)] text-[var(--accent)]',
  amber: 'bg-amber-50 text-amber-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-slate-100 text-slate-700',
} as const;

interface DashboardStatsProps {
  stats: Array<{
    label: string;
    value: string;
    icon: typeof FolderKanban | typeof CheckCircle2 | typeof FileText | typeof Share2;
    variant: keyof typeof toneMap;
    badge: string;
  }>;
}

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <GlassCard
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.35 }}
          className="min-h-[170px] rounded-[2rem] p-6"
          hoverable={false}
        >
          <div className="flex items-start justify-between">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${toneMap[stat.variant]}`}>
              <stat.icon size={22} />
            </div>
            <GlassBadge variant={stat.variant}>{stat.badge}</GlassBadge>
          </div>

          <div className="mt-10 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">{stat.label}</p>
            <h3 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">{stat.value}</h3>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
