import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { validatePortalToken, verifyPortalSession } from '@/lib/portalAuth';
import { serializeProjectDetail } from '@/lib/serializers';
import { PortalClient } from './PortalClient';

export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const project = await validatePortalToken(token);

    if (!project) return notFound();

    if (project.requireEmailVerification) {
        const cookieStore = await cookies();
        const sessionToken = cookieStore.get(`portal_session_${project._id}`);

        if (!sessionToken) {
            redirect(`/portal/${token}/verify`);
        }

        const session = await verifyPortalSession(sessionToken.value);
        if (!session || session.clientEmail !== project.clientEmail) {
            redirect(`/portal/${token}/verify`);
        }
    }

    // Since we are server-side, we can pass data to client components or fetch it here.
    // For simplicity and performance, we'll fetch once in a client wrapper or use a shared API.
    // But since common patterns in Next.js use Client Components for Tabs, let's pass initial data.

    // We'll use a Client Component for the main portal interaction.
    return (
        <PortalClient token={token} project={serializeProjectDetail(project)} />
    );
}
