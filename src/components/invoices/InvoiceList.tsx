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
                {[1, 2, 3].map(i => <div key={i} className="h-16 w-full glass-card animate-pulse rounded-2xl skeleton" />)}
            </div>
        );
    }

    if (invoices.length === 0) {
        return (
            <div className="text-center py-24 glass-card rounded-3xl" style={{ borderStyle: 'dashed', borderColor: 'var(--border-medium)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--surface-muted)' }}>
                    <DollarSign size={28} style={{ color: 'var(--text-muted)' }} />
                </div>
                <h4 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>No invoices found</h4>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create your first invoice to start getting paid.</p>
                {onCreate && (
                    <div className="mt-6">
                        <GlassButton onClick={onCreate}>Create Invoice</GlassButton>
                    </div>
                )}
            </div>
        );
    }

    return (
        <GlassCard className="p-0 overflow-hidden" style={{ borderColor: 'var(--border-medium)' }}>
            <div className="overflow-x-auto">
            <Table>
                <TableHeader style={{ background: 'var(--surface-muted)', borderBottom: '1px solid var(--border-subtle)' }}>
                    <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="w-[140px] px-4 sm:px-6 h-12 font-bold text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Invoice #</TableHead>
                        <TableHead className="px-4 sm:px-6 h-12 font-bold text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Amount</TableHead>
                        <TableHead className="px-4 sm:px-6 h-12 font-bold text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Status</TableHead>
                        <TableHead className="hidden sm:table-cell px-4 sm:px-6 h-12 font-bold text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Due Date</TableHead>
                        <TableHead className="text-right px-4 sm:px-6 h-12 font-bold text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {invoices.map((invoice) => (
                        <TableRow key={invoice._id} className="transition-colors h-14" style={{ borderColor: 'var(--border-subtle)' }}>
                            <TableCell className="font-bold px-4 sm:px-6 text-sm" style={{ color: 'var(--text-primary)' }}>{invoice.invoiceNumber}</TableCell>
                            <TableCell className="font-bold px-4 sm:px-6 text-sm" style={{ color: 'var(--text-primary)' }}>
                                {new Intl.NumberFormat('en-US', {
                                    style: 'currency',
                                    currency: invoice.currency,
                                }).format(invoice.total)}
                            </TableCell>
                            <TableCell className="px-4 sm:px-6">{getStatusBadge(invoice)}</TableCell>
                            <TableCell className="hidden sm:table-cell text-xs font-semibold uppercase tracking-wider px-4 sm:px-6" style={{ color: 'var(--text-muted)' }}>
                                {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                            </TableCell>
                            <TableCell className="text-right px-4 sm:px-6">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <GlassButton variant="ghost" size="icon" className="h-9 w-9 rounded-xl transition-all">
                                            <MoreVertical size={16} />
                                        </GlassButton>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="p-1.5 min-w-[180px]" style={{ background: 'var(--popover)', borderColor: 'var(--border-medium)', boxShadow: 'var(--shadow-modal)' }}>
                                        <DropdownMenuItem onClick={() => handleDownloadPDF(invoice._id)} className="rounded-xl gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                            <Eye size={14} style={{ color: 'var(--accent)' }} /> Preview PDF
                                        </DropdownMenuItem>

                                        {invoice.status === 'draft' && (
                                            <>
                                                <DropdownMenuItem onClick={() => onEdit(invoice)} className="rounded-xl gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                                    <Edit size={14} /> Edit Draft
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleSend(invoice._id)} className="rounded-xl gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--accent)' }}>
                                                    <Send size={14} /> Send to Client
                                                </DropdownMenuItem>
                                            </>
                                        )}

                                        {invoice.status !== 'draft' && invoice.status !== 'paid' && (
                                            <DropdownMenuItem onClick={() => handleMarkPaid(invoice._id)} className="rounded-xl gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--success)' }}>
                                                <CheckCircle size={14} /> Mark as Paid
                                            </DropdownMenuItem>
                                        )}

                                        <DropdownMenuSeparator style={{ background: 'var(--border-subtle)' }} className="my-1" />

                                        <DropdownMenuItem onClick={() => handleDownloadPDF(invoice._id)} className="rounded-xl gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                            <Download size={14} /> Download PDF
                                        </DropdownMenuItem>

                                        {invoice.status === 'draft' && (
                                            <DropdownMenuItem onClick={() => handleDelete(invoice._id)} className="rounded-xl gap-2.5 px-3 py-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--destructive)' }}>
                                                <Trash2 size={14} /> Delete Draft
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            </div>
        </GlassCard>
    );
}
