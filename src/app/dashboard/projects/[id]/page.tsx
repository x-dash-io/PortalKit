import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { ProjectDetailClient } from './ProjectDetailClient';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect('/auth/login');
    }

    return <ProjectDetailClient id={id} />;
}
