import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { NewProjectModal } from '@/components/dashboard/NewProjectModal';
import { CheckCircle2, FileText, FolderKanban, Share2, ArrowRight } from 'lucide-react';
import Approval from '@/lib/models/Approval';
import Invoice from '@/lib/models/Invoice';
import File from '@/lib/models/File';
import currency from 'currency.js';
import { getProjectCounts } from '@/lib/projectCounts';
import { serializeProjectSummary } from '@/lib/serializers';
import type { ProjectSummary } from '@/lib/contracts';
import Link from 'next/link';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect('/auth/login');

  await connectDB();
  const rawProjects = await Project.find({
    freelancerId: session.user.id,
    status: { $ne: 'archived' },
  })
    .sort({ updatedAt: -1 })
    .lean();

  const projectIds = rawProjects.map((p) => String(p._id));
  const [counts, pendingApprovals, unpaidInvoices, filesShared] = await Promise.all([
    getProjectCounts(projectIds),
    Approval.countDocuments({ projectId: { $in: projectIds }, status: 'pending' }),
    Invoice.find({ projectId: { $in: projectIds }, status: { $in: ['sent', 'viewed', 'overdue'] } })
      .select('total')
      .lean(),
    File.countDocuments({ projectId: { $in: projectIds }, status: 'active' }),
  ]);

  const projects: ProjectSummary[] = rawProjects.map((project) =>
    serializeProjectSummary(project, {
      approvals: counts.approvals[String(project._id)] ?? 0,
      files:     counts.files[String(project._id)]     ?? 0,
      invoices:  counts.invoices[String(project._id)]  ?? 0,
    })
  );

  const unpaidTotal = unpaidInvoices.reduce((t, inv) => t + inv.total, 0);
  const stats = [
    { label: 'Active Projects',    value: String(projects.length), icon: FolderKanban,  variant: 'indigo'  as const, badge: 'Overview' },
    { label: 'Pending Approvals',  value: String(pendingApprovals), icon: CheckCircle2, variant: 'amber'   as const, badge: 'Pending' },
    { label: 'Unpaid Invoices',    value: currency(unpaidTotal).format(), icon: FileText,  variant: 'emerald' as const, badge: 'Finance' },
    { label: 'Files Shared',       value: String(filesShared),      icon: Share2,       variant: 'slate'   as const, badge: 'Sharing' },
  ];

  const firstName = session.user.name?.split(' ')[0] ?? 'there';

  return (
    <div className="max-w-7xl mx-auto space-y-10 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
            Workspace overview
          </p>
          <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Welcome back, {firstName}.
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
            Here&apos;s what&apos;s happening with your projects today.
          </p>
        </div>
        <NewProjectModal />
      </div>

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Recent projects */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              <FolderKanban size={16} />
            </div>
            <h2 className="text-lg font-black" style={{ color: 'var(--text-primary)' }}>
              Recent Projects
            </h2>
          </div>
          {projects.length > 0 && (
            <Link
              href="/dashboard/projects"
              className="flex items-center gap-1 text-xs font-semibold transition-colors hover:text-[var(--accent)]"
              style={{ color: 'var(--text-muted)' }}
            >
              View all <ArrowRight size={12} />
            </Link>
          )}
        </div>

        {projects.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-16 text-center"
            style={{ borderColor: 'var(--border-medium)' }}
          >
            <div
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: 'var(--surface-muted)' }}
            >
              <FolderKanban size={26} style={{ color: 'var(--text-muted)' }} />
            </div>
            <h3 className="mb-2 text-lg font-black" style={{ color: 'var(--text-primary)' }}>
              No projects yet
            </h3>
            <p className="mb-6 max-w-xs text-sm" style={{ color: 'var(--text-secondary)' }}>
              Create your first project to start sharing files and invoices with your clients.
            </p>
            <NewProjectModal />
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.slice(0, 6).map((project, i) => (
              <div key={project._id} className="animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
