import { LucideIcon } from 'lucide-react';

interface StatConfig {
  icon: LucideIcon;
  label: string;
  value: string;
  variant: 'indigo' | 'amber' | 'emerald' | 'slate';
  badge: string;
}

const toneMap = {
  indigo:  { iconBg: 'var(--accent-light)',  iconColor: 'var(--accent)',    badgeBg: 'var(--accent-light)',  badgeColor: 'var(--accent)' },
  amber:   { iconBg: 'var(--warning-bg)',    iconColor: 'var(--warning)',   badgeBg: 'var(--warning-bg)',    badgeColor: 'var(--warning)' },
  emerald: { iconBg: 'var(--success-bg)',    iconColor: 'var(--success)',   badgeBg: 'var(--success-bg)',    badgeColor: 'var(--success)' },
  slate:   { iconBg: 'rgba(107,114,128,0.09)', iconColor: 'var(--text-muted)', badgeBg: 'rgba(107,114,128,0.08)', badgeColor: 'var(--text-secondary)' },
} as const;

interface DashboardStatsProps { stats: StatConfig[]; }

export function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => {
        const tone = toneMap[stat.variant];
        return (
          <div
            key={stat.label}
            className="glass-card animate-fade-up rounded-2xl p-5 flex flex-col gap-4"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <div className="flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ background: tone.iconBg, color: tone.iconColor }}
              >
                <stat.icon size={18} />
              </div>
              <span
                className="status-badge"
                style={{ background: tone.badgeBg, color: tone.badgeColor }}
              >
                {stat.badge}
              </span>
            </div>
            <div>
              <p
                className="text-[10px] font-bold uppercase tracking-widest mb-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {stat.label}
              </p>
              <p className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                {stat.value}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
