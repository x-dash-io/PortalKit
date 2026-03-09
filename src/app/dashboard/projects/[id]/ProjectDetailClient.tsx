'use client';

import { useEffect, useState } from 'react';
import {
    ArrowLeft, CheckCircle, CheckCircle2, Copy, Edit3,
    ExternalLink, FileText, Files, Plus, ShieldCheck, Clock, Archive,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import type { ApprovalRecord, InvoiceRecord, ProjectDetail } from '@/lib/contracts';
import { FileWorkspace } from '@/components/files/FileWorkspace';
import { InvoiceList } from '@/components/invoices/InvoiceList';
import { InvoiceEditor } from '@/components/invoices/InvoiceEditor';
import { MilestoneTracker } from '@/components/milestones/MilestoneTracker';
import { ApprovalForm } from '@/components/approvals/ApprovalForm';
import { ApprovalCard } from '@/components/approvals/ApprovalCard';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassButton } from '@/components/glass/GlassButton';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface ProjectDetailClientProps {
    project: ProjectDetail;
}

interface ProjectEditState {
    title: string;
    clientName: string;
    clientEmail: string;
    description: string;
    status: 'active' | 'completed';
    portalEnabled: boolean;
    requireEmailVerification: boolean;
}

const initialEditState = (project: ProjectDetail): ProjectEditState => ({
    title: project.title,
    clientName: project.clientName,
    clientEmail: project.clientEmail,
    description: project.description ?? '',
    status: project.status === 'completed' ? 'completed' : 'active',
    portalEnabled: project.portalEnabled,
    requireEmailVerification: project.requireEmailVerification,
});

export function ProjectDetailClient({ project: initialProject }: ProjectDetailClientProps) {
    const router = useRouter();
    const [project, setProject] = useState<ProjectDetail>(initialProject);
    const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
    const [loadingApprovals, setLoadingApprovals] = useState(true);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [isProjectEditorOpen, setIsProjectEditorOpen] = useState(false);
    const [isSavingProject, setIsSavingProject] = useState(false);
    const [isArchiving, setIsArchiving] = useState(false);
    const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
    const [editState, setEditState] = useState<ProjectEditState>(initialEditState(initialProject));
    const [invoiceEditorOpen, setInvoiceEditorOpen] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState<InvoiceRecord | null>(null);
    const [invoiceRefreshKey, setInvoiceRefreshKey] = useState(0);

    useEffect(() => {
        setProject(initialProject);
        setEditState(initialEditState(initialProject));
    }, [initialProject]);

    useEffect(() => {
        let cancelled = false;
        const fetchApprovals = async () => {
            setLoadingApprovals(true);
            try {
                const res = await fetch(`/api/projects/${project._id}/approvals`);
                if (!res.ok) throw new Error();
                const data = (await res.json()) as ApprovalRecord[];
                if (!cancelled) setApprovals(data);
            } catch {
                if (!cancelled) toast.error('Could not load approvals');
            } finally {
                if (!cancelled) setLoadingApprovals(false);
            }
        };
        void fetchApprovals();
        return () => { cancelled = true; };
    }, [project._id]);

    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter(m => m.status === 'complete').length;
    const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
    const pendingApprovals = approvals.filter(a => a.status === 'pending').length;

    const refreshApprovals = async () => {
        const res = await fetch(`/api/projects/${project._id}/approvals`);
        if (!res.ok) { toast.error('Could not refresh approvals'); return; }
        setApprovals((await res.json()) as ApprovalRecord[]);
    };

    const handleMilestoneUpdate = (updated: ProjectDetail['milestones']) => {
        setProject(cur => ({ ...cur, milestones: updated }));
    };

    const handleProjectSave = async () => {
        setIsSavingProject(true);
        try {
            const res = await fetch(`/api/projects/${project._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editState),
            });
            if (!res.ok) throw new Error();
            const updated = (await res.json()) as ProjectDetail;
            setProject(updated);
            setEditState(initialEditState(updated));
            setIsProjectEditorOpen(false);
            toast.success('Project updated');
        } catch {
            toast.error('Could not update project');
        } finally {
            setIsSavingProject(false);
        }
    };

    const handleArchive = async () => {
        setIsArchiving(true);
        try {
            const res = await fetch(`/api/projects/${project._id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success('Project archived');
            router.push('/dashboard/projects');
        } catch {
            toast.error('Could not archive project');
        } finally {
            setIsArchiving(false);
        }
    };

    const openCreateInvoice = () => { setEditingInvoice(null); setInvoiceEditorOpen(true); };
    const openEditInvoice = (inv: InvoiceRecord) => { setEditingInvoice(inv); setInvoiceEditorOpen(true); };
    const handleInvoiceSaved = () => { setInvoiceEditorOpen(false); setEditingInvoice(null); setInvoiceRefreshKey(k => k + 1); };

    const portalUrl =
        typeof window === 'undefined'
            ? `/portal/${project.portalTokenPrefix}`
            : `${window.location.protocol}//${window.location.host}/portal/${project.portalTokenPrefix}`;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <ConfirmDialog
                open={archiveConfirmOpen}
                onOpenChange={setArchiveConfirmOpen}
                title="Archive Project"
                description="This project will be hidden from your main dashboard. You can find archived projects in Settings."
                confirmLabel="Archive"
                variant="destructive"
                onConfirm={() => void handleArchive()}
            />
            {/* Header */}
            <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                        <Link href="/dashboard/projects">
                            <GlassButton variant="secondary" size="icon" className="h-9 w-9">
                                <ArrowLeft size={18} />
                            </GlassButton>
                        </Link>
                        <GlassBadge variant={project.status === 'active' ? 'indigo' : 'emerald'}>
                            {project.status === 'active' ? 'Active' : 'Completed'}
                        </GlassBadge>
                        <GlassBadge variant={project.portalEnabled ? 'emerald' : 'red'}>
                            {project.portalEnabled ? 'Portal Live' : 'Portal Off'}
                        </GlassBadge>
                    </div>

                    <div>
                        <h1 className="text-3xl md:text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                            {project.title}
                        </h1>
                        <p className="text-base mt-1" style={{ color: 'var(--text-muted)' }}>
                            {project.clientName}
                            <span className="mx-2 opacity-30">|</span>
                            {project.clientEmail}
                        </p>
                        {project.description && (
                            <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                {project.description}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <GlassButton
                        variant="secondary"
                        onClick={() => { navigator.clipboard.writeText(portalUrl); toast.success('Portal link copied'); }}
                        className="gap-2 text-sm"
                    >
                        <Copy size={14} /> Copy Link
                    </GlassButton>
                    <GlassButton variant="secondary" onClick={() => setIsProjectEditorOpen(true)} className="gap-2 text-sm">
                        <Edit3 size={14} /> Edit
                    </GlassButton>
                    <GlassButton variant="secondary" onClick={() => setArchiveConfirmOpen(true)} disabled={isArchiving} className="gap-2 text-sm" style={{ color: 'var(--warning)' }}>
                        <Archive size={14} /> {isArchiving ? 'Archiving…' : 'Archive'}
                    </GlassButton>
                    <GlassButton onClick={() => window.open(`/portal/${project.portalTokenPrefix}`, '_blank')} className="gap-2 text-sm">
                        <ExternalLink size={14} /> View Portal
                    </GlassButton>
                </div>
            </div>

            {/* Progress + Security */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <GlassCard className="lg:col-span-3 p-6">
                    <div className="flex items-end justify-between mb-5">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
                                Delivery Progress
                            </p>
                            <h2 className="text-4xl font-black" style={{ color: 'var(--text-primary)' }}>
                                {Math.round(progress)}%
                            </h2>
                        </div>
                        <GlassBadge variant="indigo">
                            {completedMilestones} / {totalMilestones} Milestones
                        </GlassBadge>
                    </div>
                    <div
                        className="h-3 w-full rounded-full overflow-hidden p-0.5"
                        style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}
                    >
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ background: 'var(--accent-gradient)' }}
                        />
                    </div>
                </GlassCard>

                <GlassCard className="p-6 flex flex-col gap-4" style={{ border: '1px dashed var(--border-medium)' }}>
                    <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center"
                        style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}
                    >
                        <ShieldCheck size={22} />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Portal Security</h4>
                        <p className="text-[10px] uppercase tracking-widest mt-1" style={{ color: 'var(--text-muted)' }}>
                            {project.requireEmailVerification ? 'Email Verified' : 'Open Access'}
                        </p>
                    </div>
                    <div className="text-xs space-y-1" style={{ color: 'var(--text-secondary)' }}>
                        <p>{pendingApprovals} pending approval(s)</p>
                        <p>{project.filesCount} file(s) shared</p>
                        <p>{project.invoicesCount} invoice(s)</p>
                    </div>
                </GlassCard>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="milestones" className="space-y-6">
                <TabsList
                    className="p-1.5 rounded-2xl h-14 inline-flex w-fit"
                    style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}
                >
                    {[
                        { value: 'milestones', icon: Clock, label: 'Milestones' },
                        { value: 'approvals', icon: CheckCircle, label: 'Approvals', badge: pendingApprovals },
                        { value: 'files', icon: Files, label: 'Files' },
                        { value: 'invoices', icon: FileText, label: 'Invoices' },
                    ].map(tab => (
                        <TabsTrigger
                            key={tab.value}
                            value={tab.value}
                            className="relative rounded-xl px-5 sm:px-8 h-full gap-2 transition-all text-[10px] sm:text-xs font-bold uppercase tracking-widest data-[state=active]:shadow-md"
                            style={{ color: 'var(--text-muted)' }}
                        >
                            <tab.icon size={15} />
                            <span className="hidden sm:inline">{tab.label}</span>
                            {tab.badge != null && tab.badge > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: 'var(--warning)' }} />
                                    <span className="relative inline-flex rounded-full h-4 w-4 text-[9px] items-center justify-center font-black" style={{ background: 'var(--warning)', color: '#fff' }}>
                                        {tab.badge}
                                    </span>
                                </span>
                            )}
                        </TabsTrigger>
                    ))}
                </TabsList>

                <AnimatePresence mode="wait">
                    <TabsContent value="milestones" className="focus-visible:outline-none">
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <MilestoneTracker
                                projectId={project._id}
                                initialMilestones={project.milestones}
                                onUpdate={handleMilestoneUpdate}
                            />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="approvals" className="focus-visible:outline-none">
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Client Approvals</h2>
                                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Send assets for client review.</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <GlassButton onClick={() => setIsApprovalModalOpen(true)} className="gap-2 text-sm">
                                        <Plus size={15} /> New Request
                                    </GlassButton>
                                    <ApprovalForm
                                        projectId={project._id}
                                        isOpen={isApprovalModalOpen}
                                        onClose={() => setIsApprovalModalOpen(false)}
                                        onSuccess={() => void refreshApprovals()}
                                    />
                                </div>
                            </div>

                            {loadingApprovals ? (
                                <div className="flex justify-center py-16">
                                    <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
                                </div>
                            ) : approvals.length === 0 ? (
                                <div
                                    className="text-center py-20 rounded-2xl"
                                    style={{ border: '2px dashed var(--border-medium)' }}
                                >
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface-muted)' }}>
                                        <CheckCircle2 size={26} style={{ color: 'var(--text-muted)' }} />
                                    </div>
                                    <h4 className="font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>No approvals yet</h4>
                                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create your first approval request to start client review.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {approvals.map(approval => (
                                        <ApprovalCard
                                            key={approval._id}
                                            approval={approval}
                                            projectId={project._id}
                                            view="freelancer"
                                            onRefresh={() => void refreshApprovals()}
                                        />
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="files" className="focus-visible:outline-none">
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                            <FileWorkspace projectId={project._id} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="invoices" className="focus-visible:outline-none">
                        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Invoices</h2>
                                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>Draft, send, and track billing.</p>
                                </div>
                                <GlassButton onClick={openCreateInvoice} className="gap-2 text-sm">
                                    <Plus size={15} /> New Invoice
                                </GlassButton>
                            </div>
                            <InvoiceList
                                projectId={project._id}
                                refreshTrigger={invoiceRefreshKey}
                                onCreate={openCreateInvoice}
                                onEdit={openEditInvoice}
                                onRefresh={() => setInvoiceRefreshKey(k => k + 1)}
                            />
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>

            {/* Edit project dialog */}
            <Dialog open={isProjectEditorOpen} onOpenChange={setIsProjectEditorOpen}>
                <DialogContent
                    className="sm:max-w-2xl rounded-2xl border-0 p-0 overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-modal)' }}
                >
                    <div className="h-1" style={{ background: 'var(--accent-gradient)' }} />
                    <div className="p-6">
                        <DialogHeader>
                            <DialogTitle style={{ color: 'var(--text-primary)' }}>Edit Project</DialogTitle>
                        </DialogHeader>
                        <div className="mt-5 space-y-5">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="project-title">Project Title</Label>
                                    <Input id="project-title" value={editState.title} onChange={e => setEditState(s => ({ ...s, title: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="project-client-name">Client Name</Label>
                                    <Input id="project-client-name" value={editState.clientName} onChange={e => setEditState(s => ({ ...s, clientName: e.target.value }))} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="project-client-email">Client Email</Label>
                                    <Input id="project-client-email" type="email" value={editState.clientEmail} onChange={e => setEditState(s => ({ ...s, clientEmail: e.target.value }))} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="project-description">Description</Label>
                                    <Textarea id="project-description" rows={4} value={editState.description} onChange={e => setEditState(s => ({ ...s, description: e.target.value }))} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Project Status</Label>
                                    <div className="flex gap-2">
                                        {(['active', 'completed'] as const).map(s => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => setEditState(prev => ({ ...prev, status: s }))}
                                                className="flex-1 rounded-xl py-2.5 text-sm font-semibold capitalize transition-all"
                                                style={{
                                                    background: editState.status === s ? 'var(--accent)' : 'var(--surface-muted)',
                                                    color: editState.status === s ? 'var(--primary-foreground)' : 'var(--text-secondary)',
                                                    border: `1px solid ${editState.status === s ? 'var(--accent)' : 'var(--border-subtle)'}`,
                                                    boxShadow: editState.status === s ? 'var(--glow-sm)' : 'none',
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3 md:grid-cols-2">
                                <div
                                    className="flex items-center justify-between rounded-xl p-4"
                                    style={{ border: '1px solid var(--border-subtle)', background: 'var(--surface-muted)' }}
                                >
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Portal Enabled</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Client can access the portal</p>
                                    </div>
                                    <Switch checked={editState.portalEnabled} onCheckedChange={v => setEditState(s => ({ ...s, portalEnabled: v }))} />
                                </div>
                                <div
                                    className="flex items-center justify-between rounded-xl p-4"
                                    style={{ border: '1px solid var(--border-subtle)', background: 'var(--surface-muted)' }}
                                >
                                    <div>
                                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Require Email Verification</p>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Verify client email on entry</p>
                                    </div>
                                    <Switch checked={editState.requireEmailVerification} onCheckedChange={v => setEditState(s => ({ ...s, requireEmailVerification: v }))} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <Button variant="outline" onClick={() => setIsProjectEditorOpen(false)}>Cancel</Button>
                                <Button onClick={() => void handleProjectSave()} disabled={isSavingProject}>
                                    {isSavingProject ? 'Saving…' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Invoice editor dialog */}
            <Dialog open={invoiceEditorOpen} onOpenChange={setInvoiceEditorOpen}>
                <DialogContent
                    className="max-w-5xl w-[95vw] rounded-2xl border-0 p-0 overflow-hidden max-h-[92vh] flex flex-col"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-modal)' }}
                >
                    <div className="h-1 shrink-0" style={{ background: 'var(--accent-gradient)' }} />
                    <div className="px-6 pt-5 pb-2 shrink-0">
                        <DialogHeader>
                            <DialogTitle style={{ color: 'var(--text-primary)' }}>
                                {editingInvoice ? 'Edit Invoice' : 'Create Invoice'}
                            </DialogTitle>
                        </DialogHeader>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 pb-6">
                        <InvoiceEditor
                            projectId={project._id}
                            project={project}
                            initialData={editingInvoice ?? undefined}
                            onSuccess={handleInvoiceSaved}
                            onCancel={() => { setInvoiceEditorOpen(false); setEditingInvoice(null); }}
                        />
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ProjectDetailClient;
