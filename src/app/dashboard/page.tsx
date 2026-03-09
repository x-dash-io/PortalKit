import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { NewProjectModal } from '@/components/dashboard/NewProjectModal';
import { CheckCircle2, FileText, FolderKanban, Share2 } from 'lucide-react';
import Approval from '@/lib/models/Approval';
import Invoice from '@/lib/models/Invoice';
import File from '@/lib/models/File';
import currency from 'currency.js';
import { getProjectCounts } from '@/lib/projectCounts';
import { serializeProjectSummary } from '@/lib/serializers';
import type { ProjectSummary } from '@/lib/contracts';

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/auth/login');

    await connectDB();
    const rawProjects = await Project.find({
        freelancerId: session.user.id,
        status: { $ne: 'archived' }
    })
        .sort({ updatedAt: -1 })
        .lean();

    const projectIds = rawProjects.map((project) => String(project._id));
    const [counts, pendingApprovals, unpaidInvoices, filesShared] = await Promise.all([
        getProjectCounts(projectIds),
        Approval.countDocuments({ projectId: { $in: projectIds }, status: 'pending' }),
        Invoice.find({
            projectId: { $in: projectIds },
            status: { $in: ['sent', 'viewed', 'overdue'] },
        })
            .select('total')
            .lean(),
        File.countDocuments({ projectId: { $in: projectIds }, status: 'active' }),
    ]);

    const projects: ProjectSummary[] = rawProjects.map((project) =>
        serializeProjectSummary(project, {
            approvals: counts.approvals[String(project._id)] ?? 0,
            files: counts.files[String(project._id)] ?? 0,
            invoices: counts.invoices[String(project._id)] ?? 0,
        })
    );

    const unpaidTotal = unpaidInvoices.reduce((total, invoice) => total + invoice.total, 0);
    const stats = [
        { label: 'Active Projects', value: String(projects.length), icon: FolderKanban, variant: 'indigo' as const, badge: 'Overview' },
        { label: 'Pending Approvals', value: String(pendingApprovals), icon: CheckCircle2, variant: 'amber' as const, badge: 'Pending' },
        { label: 'Unpaid Invoices', value: currency(unpaidTotal).format(), icon: FileText, variant: 'emerald' as const, badge: 'Finance' },
        { label: 'Files Shared', value: String(filesShared), icon: Share2, variant: 'slate' as const, badge: 'Sharing' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Workspace overview</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                        Welcome back, {session.user.name?.split(' ')[0]}.
                    </h1>
                    <p className="mt-1 text-sm text-[var(--text-secondary)]">Here&apos;s what is happening with your projects today.</p>
                </div>
                <NewProjectModal />
            </div>

            <DashboardStats stats={stats} />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FolderKanban size={20} className="text-indigo-400" />
                        <h2 className="text-xl font-bold">Recent Projects</h2>
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="glass-card flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-[var(--border-subtle)] bg-transparent p-20 text-center">
                        <div className="mb-4 rounded-3xl bg-[var(--surface)] p-6">
                            <FolderKanban size={48} className="text-[var(--text-muted)]" />
                        </div>
                        <h3 className="mb-2 text-xl font-semibold text-[var(--text-primary)]">No projects yet</h3>
                        <p className="mb-8 max-w-xs text-sm text-[var(--text-secondary)]">
                            Create your first project to start sharing files and invoices with your clients.
                        </p>
                        <NewProjectModal />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <ProjectCard key={project._id} project={project} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
