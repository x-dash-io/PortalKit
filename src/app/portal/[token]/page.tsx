import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { validatePortalToken, verifyPortalSession } from '@/lib/portalAuth';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { PortalOverview } from '@/components/portal/PortalOverview';
import { PortalFiles } from '@/components/portal/PortalFiles';
import { PortalInvoices } from '@/components/portal/PortalInvoices';
import { PortalApprovals } from '@/components/portal/PortalApprovals';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Files, CheckCircle2, LayoutDashboard } from 'lucide-react';

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
        <PortalClient token={token} project={project} />
    );
}

// Separate client component for interactivity
'use client';

import { useEffect, useState } from 'react';

function PortalClient({ token, project }: { token: string, project: any }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/portal/${token}`);
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }

                // Track visit
                fetch(`/api/portal/${token}/visit`, { method: 'POST' });
            } catch (e) { } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [token]);

    if (loading) return (
        <PortalLayout freelancerName="Loading..." projectTitle={project.title}>
            <div className="flex items-center justify-center p-20">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
        </PortalLayout>
    );

    if (!data) return <div>Failed to load data</div>;

    // In a real app, freelancerName would come from the populated project.freelancerId.name
    // For now we'll assume it's in the data or we need to add it to the model/fetch.
    const freelancerName = data.freelancerName || 'Your Freelancer';

    return (
        <PortalLayout freelancerName={freelancerName} projectTitle={project.title} theme={data.theme}>
            <div className="space-y-12">
                <PortalOverview project={data.project} />

                <Tabs defaultValue="approvals" className="space-y-8">
                    <TabsList className="bg-white/5 border border-white/5 p-1 rounded-2xl h-14 w-fit mx-auto md:mx-0 flex overflow-x-auto">
                        <TabsTrigger value="approvals" className="rounded-xl px-8 data-[state=active]:bg-indigo-600 data-[state=active]:shadow-lg h-full gap-2 transition-all">
                            <CheckCircle2 size={18} />
                            Approvals
                            {data.approvals.filter((a: any) => a.status === 'pending').length > 0 && (
                                <span className="ml-1 h-2 w-2 rounded-full bg-amber-400" />
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="files" className="rounded-xl px-8 data-[state=active]:bg-indigo-600 data-[state=active]:shadow-lg h-full gap-2 transition-all">
                            <Files size={18} />
                            Files
                        </TabsTrigger>
                        <TabsTrigger value="invoices" className="rounded-xl px-8 data-[state=active]:bg-indigo-600 data-[state=active]:shadow-lg h-full gap-2 transition-all">
                            <FileText size={18} />
                            Invoices
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="approvals" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PortalApprovals
                            approvals={data.approvals}
                            token={token}
                            projectId={project._id}
                        />
                    </TabsContent>
                    <TabsContent value="files" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PortalFiles
                            files={data.files}
                            token={token}
                        />
                    </TabsContent>
                    <TabsContent value="invoices" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PortalInvoices
                            invoices={data.invoices}
                            token={token}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </PortalLayout>
    );
}
