'use client';

import { useEffect, useState } from 'react';
import {
    ArrowLeft,
    CheckCircle,
    CheckCircle2,
    Copy,
    Edit3,
    ExternalLink,
    FileText,
    Files,
    Plus,
    ShieldCheck,
    Clock,
} from 'lucide-react';
import Link from 'next/link';
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

interface ProjectDetailClientProps {
    project: ProjectDetail;
}

interface ProjectEditState {
    title: string;
    clientName: string;
    clientEmail: string;
    description: string;
    portalEnabled: boolean;
    requireEmailVerification: boolean;
}

const initialEditState = (project: ProjectDetail): ProjectEditState => ({
    title: project.title,
    clientName: project.clientName,
    clientEmail: project.clientEmail,
    description: project.description ?? '',
    portalEnabled: project.portalEnabled,
    requireEmailVerification: project.requireEmailVerification,
});

export function ProjectDetailClient({ project: initialProject }: ProjectDetailClientProps) {
    const [project, setProject] = useState<ProjectDetail>(initialProject);
    const [approvals, setApprovals] = useState<ApprovalRecord[]>([]);
    const [loadingApprovals, setLoadingApprovals] = useState(true);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
    const [isProjectEditorOpen, setIsProjectEditorOpen] = useState(false);
    const [isSavingProject, setIsSavingProject] = useState(false);
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
                if (!res.ok) throw new Error('Failed to fetch approvals');

                const data = (await res.json()) as ApprovalRecord[];
                if (!cancelled) {
                    setApprovals(data);
                }
            } catch (error) {
                console.error('Error fetching approvals:', error);
                if (!cancelled) {
                    toast.error('Could not load approvals');
                }
            } finally {
                if (!cancelled) {
                    setLoadingApprovals(false);
                }
            }
        };

        void fetchApprovals();

        return () => {
            cancelled = true;
        };
    }, [project._id]);

    const totalMilestones = project.milestones.length;
    const completedMilestones = project.milestones.filter((milestone) => milestone.status === 'complete').length;
    const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;
    const pendingApprovals = approvals.filter((approval) => approval.status === 'pending').length;

    const refreshApprovals = async () => {
        const res = await fetch(`/api/projects/${project._id}/approvals`);
        if (!res.ok) {
            toast.error('Could not refresh approvals');
            return;
        }

        const data = (await res.json()) as ApprovalRecord[];
        setApprovals(data);
    };

    const handleMilestoneUpdate = (updatedMilestones: ProjectDetail['milestones']) => {
        setProject((current) => ({ ...current, milestones: updatedMilestones }));
    };

    const handleProjectSave = async () => {
        setIsSavingProject(true);
        try {
            const res = await fetch(`/api/projects/${project._id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editState),
            });

            if (!res.ok) throw new Error('Failed to save project');
            const updatedProject = (await res.json()) as ProjectDetail;
            setProject(updatedProject);
            setEditState(initialEditState(updatedProject));
            setIsProjectEditorOpen(false);
            toast.success('Project updated');
        } catch {
            toast.error('Could not update project');
        } finally {
            setIsSavingProject(false);
        }
    };

    const openCreateInvoice = () => {
        setEditingInvoice(null);
        setInvoiceEditorOpen(true);
    };

    const openEditInvoice = (invoice: InvoiceRecord) => {
        setEditingInvoice(invoice);
        setInvoiceEditorOpen(true);
    };

    const handleInvoiceSaved = () => {
        setInvoiceEditorOpen(false);
        setEditingInvoice(null);
        setInvoiceRefreshKey((current) => current + 1);
    };

    const portalUrl =
        typeof window === 'undefined'
            ? `/portal/${project.portalTokenPrefix}`
            : `${window.location.protocol}//${window.location.host}/portal/${project.portalTokenPrefix}`;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
                <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard/projects">
                            <GlassButton variant="secondary" size="icon" className="h-10 w-10">
                                <ArrowLeft size={20} />
                            </GlassButton>
                        </Link>
                        <GlassBadge variant={project.status === 'active' ? 'indigo' : 'emerald'}>
                            {project.status === 'active' ? 'Active Project' : 'Completed'}
                        </GlassBadge>
                        <GlassBadge variant={project.portalEnabled ? 'emerald' : 'red'}>
                            {project.portalEnabled ? 'Portal Live' : 'Portal Disabled'}
                        </GlassBadge>
                    </div>

                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">{project.title}</h1>
                        <p className="text-lg font-bold text-[var(--text-muted)]">
                            {project.clientName} <span className="text-white/20 px-2">|</span> {project.clientEmail}
                        </p>
                        {project.description && (
                            <p className="mt-4 max-w-3xl text-[var(--text-secondary)] leading-relaxed">{project.description}</p>
                        )}
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <GlassButton
                        variant="secondary"
                        onClick={() => {
                            navigator.clipboard.writeText(portalUrl);
                            toast.success('Portal link copied');
                        }}
                        className="gap-2"
                    >
                        <Copy size={16} />
                        Copy Link
                    </GlassButton>
                    <GlassButton
                        variant="secondary"
                        onClick={() => setIsProjectEditorOpen(true)}
                        className="gap-2"
                    >
                        <Edit3 size={16} />
                        Edit Project
                    </GlassButton>
                    <GlassButton
                        onClick={() => window.open(`/portal/${project.portalTokenPrefix}`, '_blank')}
                        className="gap-2 px-8"
                    >
                        <ExternalLink size={16} />
                        View Portal
                    </GlassButton>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <GlassCard className="lg:col-span-3 p-8">
                    <div className="flex items-end justify-between mb-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Delivery Progress</p>
                            <h2 className="text-5xl font-black text-white">{Math.round(progress)}%</h2>
                        </div>
                        <div className="text-right space-y-2">
                            <GlassBadge variant="indigo">
                                {completedMilestones} / {totalMilestones} Milestones
                            </GlassBadge>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">On Track for Completion</p>
                        </div>
                    </div>
                    <div className="h-5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-1 relative shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.2, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-400 rounded-full shadow-[0_0_20px_var(--accent)]"
                        />
                    </div>
                </GlassCard>

                <GlassCard className="p-8 flex flex-col justify-between gap-6 border-dashed">
                    <div className="space-y-4">
                        <div className="h-16 w-16 bg-white/5 rounded-3xl flex items-center justify-center text-[var(--text-muted)]">
                            <ShieldCheck size={32} />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-sm font-black text-white">Portal Security</h4>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">
                                {project.requireEmailVerification ? 'Email Verification Enabled' : 'Open Link Access'}
                            </p>
                        </div>
                    </div>
                    <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                        <p>{pendingApprovals} pending approval request(s)</p>
                        <p>{project.filesCount} active file(s) shared</p>
                        <p>{project.invoicesCount} invoice(s) issued</p>
                    </div>
                </GlassCard>
            </div>

            <Tabs defaultValue="milestones" className="space-y-10">
                <TabsList className="bg-white/5 border border-white/5 p-1.5 rounded-2xl h-16 inline-flex w-fit shadow-2xl backdrop-blur-3xl">
                    <TabsTrigger value="milestones" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl h-full gap-3 transition-all font-black text-xs uppercase tracking-widest">
                        <Clock size={18} />
                        Milestones
                    </TabsTrigger>
                    <TabsTrigger value="approvals" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl h-full gap-3 transition-all font-black text-xs uppercase tracking-widest relative">
                        <CheckCircle size={18} />
                        Approvals
                        {pendingApprovals > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 text-[10px] text-white items-center justify-center font-black">
                                    {pendingApprovals}
                                </span>
                            </span>
                        )}
                    </TabsTrigger>
                    <TabsTrigger value="files" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl h-full gap-3 transition-all font-black text-xs uppercase tracking-widest">
                        <Files size={18} />
                        Files
                    </TabsTrigger>
                    <TabsTrigger value="invoices" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl h-full gap-3 transition-all font-black text-xs uppercase tracking-widest">
                        <FileText size={18} />
                        Invoices
                    </TabsTrigger>
                </TabsList>

                <AnimatePresence mode="wait">
                    <TabsContent value="milestones" className="focus-visible:outline-none">
                        <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }}>
                            <MilestoneTracker
                                projectId={project._id}
                                initialMilestones={project.milestones}
                                onUpdate={handleMilestoneUpdate}
                            />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="approvals" className="focus-visible:outline-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                            className="space-y-8"
                        >
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <h2 className="text-2xl font-black text-white tracking-tight">Client Approvals</h2>
                                    <p className="text-sm font-bold text-[var(--text-muted)]">Send assets for client review and feedback.</p>
                                </div>
                                <GlassButton onClick={() => setIsApprovalModalOpen(true)} className="gap-2">
                                    <Plus size={18} />
                                    New Request
                                </GlassButton>
                                <ApprovalForm
                                    projectId={project._id}
                                    isOpen={isApprovalModalOpen}
                                    onClose={() => setIsApprovalModalOpen(false)}
                                    onSuccess={() => void refreshApprovals()}
                                />
                            </div>

                            {loadingApprovals ? (
                                <div className="flex justify-center py-20">
                                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6">
                                    {approvals.map((approval) => (
                                        <ApprovalCard
                                            key={approval._id}
                                            approval={approval}
                                            projectId={project._id}
                                            view="freelancer"
                                            onRefresh={() => void refreshApprovals()}
                                        />
                                    ))}
                                    {approvals.length === 0 && (
                                        <div className="text-center py-32 glass-card border-dashed border-white/5 bg-transparent rounded-3xl">
                                            <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                                <CheckCircle2 size={32} className="text-[var(--text-muted)]" />
                                            </div>
                                            <h4 className="text-white font-bold mb-1">No approvals found</h4>
                                            <p className="text-[var(--text-muted)] text-sm">Create your first approval request to start client review.</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="files" className="focus-visible:outline-none">
                        <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }}>
                            <FileWorkspace projectId={project._id} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="invoices" className="focus-visible:outline-none">
                        <motion.div initial={{ opacity: 0, scale: 0.98, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98, y: -10 }} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Invoices</h2>
                                    <p className="text-sm font-bold text-[var(--text-muted)]">Draft, send, and reconcile project billing.</p>
                                </div>
                                <GlassButton onClick={openCreateInvoice} className="gap-2">
                                    <Plus size={18} />
                                    New Invoice
                                </GlassButton>
                            </div>

                            <InvoiceList
                                projectId={project._id}
                                refreshTrigger={invoiceRefreshKey}
                                onCreate={openCreateInvoice}
                                onEdit={openEditInvoice}
                                onRefresh={() => setInvoiceRefreshKey((current) => current + 1)}
                            />
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>

            <Dialog open={isProjectEditorOpen} onOpenChange={setIsProjectEditorOpen}>
                <DialogContent className="glass-card sm:max-w-2xl border-white/10">
                    <DialogHeader>
                        <DialogTitle>Edit Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5">
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="project-title">Project Title</Label>
                                <Input
                                    id="project-title"
                                    value={editState.title}
                                    onChange={(event) => setEditState((current) => ({ ...current, title: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="project-client-name">Client Name</Label>
                                <Input
                                    id="project-client-name"
                                    value={editState.clientName}
                                    onChange={(event) => setEditState((current) => ({ ...current, clientName: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="project-client-email">Client Email</Label>
                                <Input
                                    id="project-client-email"
                                    type="email"
                                    value={editState.clientEmail}
                                    onChange={(event) => setEditState((current) => ({ ...current, clientEmail: event.target.value }))}
                                />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="project-description">Description</Label>
                                <Textarea
                                    id="project-description"
                                    rows={5}
                                    value={editState.description}
                                    onChange={(event) => setEditState((current) => ({ ...current, description: event.target.value }))}
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div>
                                    <p className="font-semibold">Portal Enabled</p>
                                    <p className="text-sm text-[var(--text-secondary)]">Keep the project portal accessible to the client.</p>
                                </div>
                                <Switch
                                    checked={editState.portalEnabled}
                                    onCheckedChange={(checked) => setEditState((current) => ({ ...current, portalEnabled: checked }))}
                                />
                            </div>
                            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div>
                                    <p className="font-semibold">Require Email Verification</p>
                                    <p className="text-sm text-[var(--text-secondary)]">Require the client email before portal entry.</p>
                                </div>
                                <Switch
                                    checked={editState.requireEmailVerification}
                                    onCheckedChange={(checked) =>
                                        setEditState((current) => ({ ...current, requireEmailVerification: checked }))
                                    }
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsProjectEditorOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => void handleProjectSave()} disabled={isSavingProject}>
                                {isSavingProject ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={invoiceEditorOpen} onOpenChange={setInvoiceEditorOpen}>
                <DialogContent className="glass-card max-w-5xl border-white/10">
                    <DialogHeader>
                        <DialogTitle>{editingInvoice ? 'Edit Invoice' : 'Create Invoice'}</DialogTitle>
                    </DialogHeader>
                    <InvoiceEditor
                        projectId={project._id}
                        project={project}
                        initialData={editingInvoice ?? undefined}
                        onSuccess={handleInvoiceSaved}
                        onCancel={() => {
                            setInvoiceEditorOpen(false);
                            setEditingInvoice(null);
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default ProjectDetailClient;
