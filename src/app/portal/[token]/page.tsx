import { PortalClientWrapper } from './PortalClientWrapper';

// This page is intentionally not server-validated — the PortalClient handles
// authentication and 404 states via the /api/portal/[token] API route.
export default async function PortalPage({ params }: { params: Promise<{ token: string }> }) {
    const { token } = await params;
    return <PortalClientWrapper token={token} />;
}
