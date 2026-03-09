import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { getProjectCounts } from '@/lib/projectCounts';
import { serializeProjectSummary } from '@/lib/serializers';
import { ProjectsIndexClient } from './ProjectsIndexClient';

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/login');
  }
  const params = await searchParams;

  await connectDB();

  const rawProjects = await Project.find({ freelancerId: session.user.id })
    .select('-portalTokenHash -__v')
    .sort({ updatedAt: -1 })
    .lean();

  const counts = await getProjectCounts(rawProjects.map((project) => String(project._id)));
  const projects = rawProjects.map((project) =>
    serializeProjectSummary(project, {
      approvals: counts.approvals[String(project._id)] ?? 0,
      files: counts.files[String(project._id)] ?? 0,
      invoices: counts.invoices[String(project._id)] ?? 0,
    })
  );

  return (
    <ProjectsIndexClient
      projects={projects}
      initialQuery={params.q ?? ''}
      initialStatus={
        params.status === 'active' || params.status === 'completed' || params.status === 'archived'
          ? params.status
          : 'all'
      }
    />
  );
}
