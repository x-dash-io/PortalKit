import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { notFound, redirect } from 'next/navigation';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { getProjectCounts } from '@/lib/projectCounts';
import { serializeProjectDetail } from '@/lib/serializers';
import { ProjectDetailClient } from './ProjectDetailClient';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/login');
    }

    await connectDB();
    const project = await Project.findOne({ _id: id, freelancerId: session.user.id }).select('-portalTokenHash -__v').lean();

    if (!project) {
        notFound();
    }

    const counts = await getProjectCounts([id]);

    return (
        <ProjectDetailClient
            project={serializeProjectDetail(project, {
                approvals: counts.approvals[id] ?? 0,
                files: counts.files[id] ?? 0,
                invoices: counts.invoices[id] ?? 0,
            })}
        />
    );
}
