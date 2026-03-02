'use client';

import { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle,
    Clock,
    Copy,
    Edit3,
    ExternalLink,
    FileText,
    Files,
    Plus,
    CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

// Custom components
import { FileWorkspace } from '@/components/files/FileWorkspace';
import { InvoiceList } from '@/components/invoices/InvoiceList';
import { MilestoneTracker } from '@/components/milestones/MilestoneTracker';
import { ApprovalForm } from '@/components/approvals/ApprovalForm';
import { ApprovalCard } from '@/components/approvals/ApprovalCard';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassButton } from '@/components/glass/GlassButton';

export default function ProjectDetailClient({ project: initialProject }: { project: any }) {
    const [project, setProject] = useState(initialProject);
    const [approvals, setApprovals] = useState<any[]>([]);
    const [loadingApprovals, setLoadingApprovals] = useState(true);
    const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

    useEffect(() => {
        if (project?._id) {
            fetchApprovals();
        }
    }, [project?._id]);

    const fetchApprovals = async () => {
        try {
            const res = await fetch(`/api/projects/${project._id}/approvals`);
            if (res.ok) {
                const data = await res.json();
                setApprovals(data);
            }
        } catch (error) {
            console.error('Error fetching approvals:', error);
        } finally {
            setLoadingApprovals(false);
        }
    };

    const handleMilestoneUpdate = (updatedMilestones: any[]) => {
        setProject({ ...project, milestones: updatedMilestones });
    };

    const totalMilestones = project.milestones?.length || 0;
    const completedMilestones = project.milestones?.filter((m: any) => m.status === 'complete').length || 0;
    const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-4">
                        <Link href="/dashboard">
                            <GlassButton variant="secondary" size="icon" className="h-10 w-10">
                                <ArrowLeft size={20} />
                            </GlassButton>
                        </Link>
                        <GlassBadge variant={project.status === 'active' ? 'indigo' : 'emerald'}>
                            {project.status === 'active' ? 'Active Project' : 'Completed'}
                        </GlassBadge>
                    </div>
                    <div>
                        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
                            {project.title}
                        </h1>
                        <p className="text-lg font-bold text-[var(--text-muted)]">
                            {project.clientName} <span className="text-white/20 px-2">|</span> {project.clientEmail}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <GlassButton
                        variant="secondary"
                        onClick={() => {
                            const url = `${window.location.protocol}//${window.location.host}/portal/${project.portalTokenPrefix}`;
                            navigator.clipboard.writeText(url);
                            toast.success('Portal link copied');
                        }}
                        className="gap-2"
                    >
                        <Copy size={16} />
                        Copy Link
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

            {/* Project Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <GlassCard className="md:col-span-3 p-8">
                    <div className="flex items-end justify-between mb-6">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Delivery Progress</p>
                            <h2 className="text-5xl font-black text-white">{Math.round(progress)}%</h2>
                        </div>
                        <div className="text-right space-y-2">
                            <GlassBadge variant="indigo">{completedMilestones} / {totalMilestones} Milestones</GlassBadge>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase">On Track for Completion</p>
                        </div>
                    </div>
                    <div className="h-5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 p-1 relative shadow-inner">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full shadow-[0_0_20px_var(--accent)]"
                        />
                    </div>
                </GlassCard>
                <GlassCard className="p-8 flex flex-col items-center justify-center text-center gap-6 group hover:border-indigo-500/30 transition-all border-dashed">
                    <div className="h-20 w-20 bg-white/5 rounded-3xl flex items-center justify-center text-[var(--text-muted)] group-hover:scale-110 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all duration-500">
                        <Edit3 size={40} />
                    </div>
                    <div className="space-y-1">
                        <h4 className="text-sm font-black text-white">Project Details</h4>
                        <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Edit configuration</p>
                    </div>
                    <GlassButton variant="ghost" size="sm" className="w-full rounded-xl">Edit Project</GlassButton>
                </GlassCard>
            </div>

            {/* Feature Tabs */}
            <Tabs defaultValue="milestones" className="space-y-10">
                <TabsList className="bg-white/5 border border-white/5 p-1.5 rounded-2xl h-16 inline-flex w-fit shadow-2xl backdrop-blur-3xl">
                    <TabsTrigger value="milestones" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl h-full gap-3 transition-all font-black text-xs uppercase tracking-widest">
                        <Clock size={18} />
                        Milestones
                    </TabsTrigger>
                    <TabsTrigger value="approvals" className="rounded-xl px-10 data-[state=active]:bg-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-xl h-full gap-3 transition-all font-black text-xs uppercase tracking-widest relative">
                        <CheckCircle size={18} />
                        Approvals
                        {approvals.filter(a => a.status === 'pending').length > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-5 w-5 bg-amber-500 text-[10px] text-white items-center justify-center font-black">
                                    {approvals.filter(a => a.status === 'pending').length}
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
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        >
                            <MilestoneTracker
                                projectId={project._id}
                                initialMilestones={project.milestones || []}
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
                                    <p className="text-sm font-bold text-[var(--text-muted)]">Send assets for client review and feedback</p>
                                </div>
                                <GlassButton
                                    onClick={() => setIsApprovalModalOpen(true)}
                                    className="gap-2"
                                >
                                    <Plus size={18} />
                                    New Request
                                </GlassButton>
                                <ApprovalForm
                                    projectId={project._id}
                                    isOpen={isApprovalModalOpen}
                                    onClose={() => setIsApprovalModalOpen(false)}
                                    onSuccess={fetchApprovals}
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
                                            onRefresh={fetchApprovals}
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
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        >
                            <FileWorkspace projectId={project._id} />
                        </motion.div>
                    </TabsContent>

                    <TabsContent value="invoices" className="focus-visible:outline-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.98, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.98, y: -10 }}
                        >
                            <InvoiceList
                                projectId={project._id}
                                refreshTrigger={0}
                                onEdit={() => { }}
                                onRefresh={() => { }}
                            />
                        </motion.div>
                    </TabsContent>
                </AnimatePresence>
            </Tabs>
        </div>
    );
}
