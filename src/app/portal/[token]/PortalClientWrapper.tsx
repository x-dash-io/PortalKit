'use client';

import { useEffect, useState } from 'react';
import { FileText, Files, CheckCircle2, ShieldOff } from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { PortalOverview } from '@/components/portal/PortalOverview';
import { PortalFiles } from '@/components/portal/PortalFiles';
import { PortalInvoices } from '@/components/portal/PortalInvoices';
import { PortalApprovals } from '@/components/portal/PortalApprovals';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PortalPayload } from '@/lib/contracts';

type LoadState = 'loading' | 'verify' | 'ready' | 'error' | 'not_found';

export function PortalClientWrapper({ token }: { token: string }) {
    const [state, setState] = useState<LoadState>('loading');
    const [data, setData] = useState<PortalPayload | null>(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const res = await fetch(`/api/portal/${token}`);

                if (res.status === 404) {
                    if (!cancelled) setState('not_found');
                    return;
                }
                if (res.status === 401) {
                    // Requires email verification — redirect to verify page
                    window.location.href = `/portal/${token}/verify`;
                    return;
                }
                if (!res.ok) {
                    if (!cancelled) setState('error');
                    return;
                }

                const json = (await res.json()) as PortalPayload;
                if (!cancelled) {
                    setData(json);
                    setState('ready');
                }

                void fetch(`/api/portal/${token}/visit`, { method: 'POST' });
            } catch {
                if (!cancelled) setState('error');
            }
        };

        void load();
        return () => { cancelled = true; };
    }, [token]);

    if (state === 'loading') {
        return (
            <PortalLayout freelancerName="Loading…" projectTitle="Portal">
                <div className="flex items-center justify-center py-32">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
                </div>
            </PortalLayout>
        );
    }

    if (state === 'not_found') {
        return (
            <PortalLayout freelancerName="PortalKit" projectTitle="Not Found">
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center"
                        style={{ background: 'var(--surface-muted)' }}
                    >
                        <ShieldOff size={28} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Portal not found
                    </h2>
                    <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                        This portal link is invalid or has been disabled by the project owner.
                    </p>
                </div>
            </PortalLayout>
        );
    }

    if (state === 'error') {
        return (
            <PortalLayout freelancerName="PortalKit" projectTitle="Unavailable">
                <div className="flex flex-col items-center justify-center py-32 text-center space-y-4">
                    <h2 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                        Portal unavailable
                    </h2>
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                        We could not load this portal. Please try again in a moment.
                    </p>
                    <button
                        onClick={() => { setState('loading'); }}
                        className="rounded-xl px-5 py-2.5 text-sm font-bold transition-all"
                        style={{ background: 'var(--accent-gradient)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow-sm)' }}
                    >
                        Retry
                    </button>
                </div>
            </PortalLayout>
        );
    }

    if (!data) return null;

    return (
        <PortalLayout
            freelancerName={data.freelancerName}
            projectTitle={data.project.title}
            theme={data.theme}
            freelancerLogo={data.freelancerLogo}
        >
            <div className="space-y-12">
                <PortalOverview project={data.project} />

                <Tabs defaultValue="approvals" className="space-y-8">
                    <TabsList className="flex h-12 w-full overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-1 shadow-[var(--shadow-soft)]">
                        <TabsTrigger value="approvals" className="flex-1 h-full gap-1.5 rounded-xl px-3 sm:px-8 text-xs sm:text-sm data-[state=active]:bg-[var(--accent-light)] data-[state=active]:text-[var(--accent)]">
                            <CheckCircle2 size={15} />
                            <span>Approvals</span>
                            {data.approvals.filter(a => a.status === 'pending').length > 0 && (
                                <span className="ml-0.5 h-2 w-2 rounded-full bg-amber-400 shrink-0" />
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="files" className="flex-1 h-full gap-1.5 rounded-xl px-3 sm:px-8 text-xs sm:text-sm data-[state=active]:bg-[var(--accent-light)] data-[state=active]:text-[var(--accent)]">
                            <Files size={15} />
                            <span>Files</span>
                        </TabsTrigger>
                        <TabsTrigger value="invoices" className="flex-1 h-full gap-1.5 rounded-xl px-3 sm:px-8 text-xs sm:text-sm data-[state=active]:bg-[var(--accent-light)] data-[state=active]:text-[var(--accent)]">
                            <FileText size={15} />
                            <span>Invoices</span>
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="approvals" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PortalApprovals approvals={data.approvals} token={token} projectId={data.project._id} />
                    </TabsContent>
                    <TabsContent value="files" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PortalFiles files={data.files} token={token} />
                    </TabsContent>
                    <TabsContent value="invoices" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <PortalInvoices invoices={data.invoices} token={token} />
                    </TabsContent>
                </Tabs>
            </div>
        </PortalLayout>
    );
}
