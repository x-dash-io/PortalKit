'use client';

import React, { useEffect, useState } from 'react';
import {
    MoreVertical,
    FileText,
    Download,
    Send,
    CheckCircle,
    Trash2,
    Edit,
    Eye,
    Clock,
    DollarSign
} from 'lucide-react';
import { format, isBefore, startOfDay } from 'date-fns';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import type { InvoiceRecord } from '@/lib/contracts';

// Glass Components
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassButton } from '@/components/glass/GlassButton';

interface InvoiceListProps {
    projectId: string;
    refreshTrigger: number;
    onEdit: (invoice: InvoiceRecord) => void;
    onRefresh: () => void;
    onCreate?: () => void;
}

export function InvoiceList({ projectId, refreshTrigger, onEdit, onRefresh, onCreate }: InvoiceListProps) {
    const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/invoices`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setInvoices(data);
        } catch (error) {
            toast.error('Could not load invoices');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, [projectId, refreshTrigger]);

    const handleSend = async (invoiceId: string) => {
        if (!confirm('Send this invoice to the client?')) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/invoices/${invoiceId}/send`, { method: 'POST' });
            if (!res.ok) throw new Error('Send failed');
            toast.success('Invoice sent to client');
            onRefresh();
            fetchInvoices();
        } catch (error) {
            toast.error('Could not send invoice');
        }
    };

    const handleMarkPaid = async (invoiceId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/invoices/${invoiceId}/mark-paid`, { method: 'POST' });
            if (!res.ok) throw new Error('Update failed');
            toast.success('Invoice marked as paid');
            onRefresh();
            fetchInvoices();
        } catch (error) {
            toast.error('Could not update invoice');
        }
    };

    const handleDelete = async (invoiceId: string) => {
        if (!confirm('Delete this draft invoice?')) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/invoices/${invoiceId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            toast.success('Invoice deleted');
            onRefresh();
            fetchInvoices();
        } catch (error) {
            toast.error('Could not delete invoice');
        }
    };

    const handleDownloadPDF = (invoiceId: string) => {
        window.open(`/api/projects/${projectId}/invoices/${invoiceId}/pdf`, '_blank');
    };

    const getStatusBadge = (invoice: InvoiceRecord) => {
        const isOverdue = (invoice.status === 'sent' || invoice.status === 'viewed') &&
            isBefore(new Date(invoice.dueDate), startOfDay(new Date()));

        if (isOverdue) return <GlassBadge variant="red" className="gap-1.5"><Clock size={12} /> Overdue</GlassBadge>;

        switch (invoice.status) {
            case 'draft': return <GlassBadge variant="slate">Draft</GlassBadge>;
            case 'sent': return <GlassBadge variant="indigo">Sent</GlassBadge>;
            case 'viewed': return <GlassBadge variant="amber">Viewed</GlassBadge>;
            case 'paid': return <GlassBadge variant="emerald">Paid</GlassBadge>;
            default: return null;
        }
    };

    if (loading && invoices.length === 0) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-16 w-full glass-card animate-pulse rounded-2xl bg-white/5" />)}
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="text-center py-32 glass-card bg-transparent border-dashed border-white/5 rounded-3xl">
                <div className="bg-white/5 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <DollarSign size={32} className="text-[var(--text-muted)]" />
                </div>
                <h4 className="text-white font-bold mb-1">No invoices found</h4>
                <p className="text-[var(--text-muted)] text-sm">Create your first invoice to start getting paid.</p>
                {onCreate && (
                    <div className="mt-6">
                        <GlassButton onClick={onCreate}>Create Invoice</GlassButton>
                    </div>
                )}
            </div>
        );
    }

    return (
        <GlassCard className="p-0 overflow-hidden border-white/5">
            <Table>
                <TableHeader className="bg-white/5 border-b border-white/5">
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="w-[140px] px-6 h-14 font-black text-[10px] uppercase tracking-widest text-white/40">Invoice #</TableHead>
                        <TableHead className="px-6 h-14 font-black text-[10px] uppercase tracking-widest text-white/40">Amount</TableHead>
                        <TableHead className="px-6 h-14 font-black text-[10px] uppercase tracking-widest text-white/40">Status</TableHead>
                        <TableHead className="px-6 h-14 font-black text-[10px] uppercase tracking-widest text-white/40">Due Date</TableHead>
                        <TableHead className="text-right px-6 h-14 font-black text-[10px] uppercase tracking-widest text-white/40">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice._id} className="border-white/5 hover:bg-white/5 transition-colors h-16">
                            <TableCell className="font-bold px-6 text-white">{invoice.invoiceNumber}</TableCell>
                            <TableCell className="font-black px-6 text-white text-base">
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: invoice.currency,
                                }).format(invoice.total)}
                            </TableCell>
                            <TableCell className="px-6">{getStatusBadge(invoice)}</TableCell>
                            <TableCell className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider px-6">
                                {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell className="text-right px-6">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <GlassButton variant="ghost" size="icon" className="h-10 w-10 hover:bg-white/10 rounded-xl transition-all">
                                            <MoreVertical size={18} />
                                        </GlassButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="glass-card border-white/10 p-2 min-w-[180px] shadow-2xl backdrop-blur-3xl">
                                        <DropdownMenuItem onClick={() => handleDownloadPDF(invoice._id)} className="rounded-xl focus:bg-indigo-600/10 gap-3 px-4 py-2.5 font-bold text-xs">
                                            <Eye size={16} className="text-indigo-400" /> Preview PDF
                                        </DropdownMenuItem>

                                        {invoice.status === 'draft' && (
                                            <>
                                                <DropdownMenuItem onClick={() => onEdit(invoice)} className="rounded-xl focus:bg-indigo-600/10 gap-3 px-4 py-2.5 font-bold text-xs">
                                                    <Edit size={16} /> Edit Draft
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSend(invoice._id)} className="rounded-xl focus:bg-indigo-600/10 gap-3 px-4 py-2.5 font-bold text-xs text-indigo-400">
                                                    <Send size={16} /> Send to Client
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        {invoice.status !== 'draft' && invoice.status !== 'paid' && (
                                            <DropdownMenuItem onClick={() => handleMarkPaid(invoice._id)} className="rounded-xl focus:bg-indigo-600/10 gap-3 px-4 py-2.5 font-bold text-xs text-green-400">
                                                <CheckCircle size={16} /> Mark as Paid
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuSeparator className="bg-white/5 my-2" />

                                        <DropdownMenuItem onClick={() => handleDownloadPDF(invoice._id)} className="rounded-xl focus:bg-indigo-600/10 gap-3 px-4 py-2.5 font-bold text-xs">
                                            <Download size={16} /> Download PDF
                                        </DropdownMenuItem>

                                        {invoice.status === 'draft' && (
                                            <DropdownMenuItem onClick={() => handleDelete(invoice._id)} className="rounded-xl focus:bg-red-600/10 gap-3 px-4 py-2.5 font-bold text-xs text-red-500">
                                                <Trash2 size={16} /> Delete Draft
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </GlassCard>
    );
}
