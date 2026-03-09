'use client';

import { useEffect, useState } from 'react';
import { FileText, Files, CheckCircle2 } from 'lucide-react';
import { PortalLayout } from '@/components/portal/PortalLayout';
import { PortalOverview } from '@/components/portal/PortalOverview';
import { PortalFiles } from '@/components/portal/PortalFiles';
import { PortalInvoices } from '@/components/portal/PortalInvoices';
import { PortalApprovals } from '@/components/portal/PortalApprovals';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { PortalPayload, ProjectDetail } from '@/lib/contracts';

export function PortalClient({ token, project }: { token: string; project: ProjectDetail }) {
  const [data, setData] = useState<PortalPayload | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/portal/${token}`);
        if (!res.ok) throw new Error('Failed to load portal');

        const json = (await res.json()) as PortalPayload;
        if (!cancelled) {
          setData(json);
        }

        void fetch(`/api/portal/${token}/visit`, { method: 'POST' });
      } catch {
        if (!cancelled) {
          setData(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      cancelled = true;
    };
  }, [token]);

  if (loading) {
    return (
      <PortalLayout freelancerName="Loading..." projectTitle={project.title}>
        <div className="flex items-center justify-center p-20">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
        </div>
      </PortalLayout>
    );
  }

  if (!data) {
    return (
      <PortalLayout freelancerName="Unavailable" projectTitle={project.title}>
        <div className="glass-card rounded-[2rem] p-12 text-center">
          <h2 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Portal unavailable</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            We could not load this portal right now. Please try again in a moment.
          </p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout freelancerName={data.freelancerName} projectTitle={project.title} theme={data.theme} freelancerLogo={data.freelancerLogo}>
      <div className="space-y-12">
        <PortalOverview project={data.project} />

        <Tabs defaultValue="approvals" className="space-y-8">
          <TabsList className="flex h-12 w-full overflow-x-auto rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] p-1 shadow-[var(--shadow-soft)]">
            <TabsTrigger value="approvals" className="flex-1 h-full gap-1.5 rounded-xl px-3 sm:px-8 text-xs sm:text-sm data-[state=active]:bg-[var(--accent-light)] data-[state=active]:text-[var(--accent)]">
              <CheckCircle2 size={15} />
              <span>Approvals</span>
              {data.approvals.filter((approval) => approval.status === 'pending').length > 0 && (
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
            <PortalApprovals approvals={data.approvals} token={token} projectId={project._id} />
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
