import { validatePortalToken } from '@/lib/portalAuth';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { VerificationForm } from '@/components/portal/VerificationForm';
import { notFound } from 'next/navigation';

export default async function VerifyPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    const project = await validatePortalToken(token);

    if (!project) return notFound();

    return (
        <PortalLayout freelancerName="Verification" projectTitle={project.title}>
            <div className="min-h-[60vh] flex items-center justify-center">
                <VerificationForm token={token} />
            </div>
        </PortalLayout>
    );
}
