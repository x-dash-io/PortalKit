import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { NewProjectModal } from '@/components/dashboard/NewProjectModal';
import { FolderKanban } from 'lucide-react';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';

async function DashboardContent() {
    const session = await getServerSession(authOptions);
    if (!session) redirect('/auth/login');

    await connectDB();
    const projects = await Project.find({
        freelancerId: session.user.id,
        status: { $ne: 'archived' }
    })
        .sort({ updatedAt: -1 })
        .lean();

    return (
        <div className="max-w-7xl mx-auto space-y-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session.user.name?.split(' ')[0]}!</h1>
                    <p className="text-[var(--text-secondary)] mt-1">Here&apos;s what is happening with your projects.</p>
                </div>
                <NewProjectModal />
            </div>

            <DashboardStats />

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <FolderKanban size={20} className="text-indigo-400" />
                        <h2 className="text-xl font-bold">Recent Projects</h2>
                    </div>
                </div>

                {projects.length === 0 ? (
                    <div className="glass-card flex flex-col items-center justify-center p-20 text-center border-dashed border-2 border-white/5 bg-transparent">
                        <div className="bg-white/5 p-6 rounded-3xl mb-4">
                            <FolderKanban size={48} className="text-[var(--text-muted)]" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No projects yet</h3>
                        <p className="text-[var(--text-secondary)] max-w-xs mb-8">
                            Create your first project to start sharing files and invoices with your clients.
                        </p>
                        <NewProjectModal />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project: any) => (
                            <ProjectCard key={project._id.toString()} project={{
                                ...project,
                                _id: project._id.toString(),
                                updatedAt: project.updatedAt.toISOString(),
                            }} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={<DashboardSkeleton />}>
                <DashboardContent />
            </Suspense>
        </DashboardLayout>
    );
}
