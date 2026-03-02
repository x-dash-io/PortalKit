'use client';

import React, { useState } from 'react';
import {
    FileText,
    Download,
    Calendar,
    CreditCard,
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import currency from 'currency.js';
import { cn } from '@/lib/utils';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';

interface PortalInvoicesProps {
    invoices: any[];
    token: string;
}

export function PortalInvoices({ invoices, token }: PortalInvoicesProps) {
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    const handleViewInvoice = async (invoice: any) => {
        setSelectedInvoice(invoice);
        // Track view
        fetch(`/api/portal/${token}/invoices/${invoice._id}/view`, { method: 'POST' });
    };

    const statusConfig = {
        sent: { label: 'Unpaid', class: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
        paid: { label: 'Paid', class: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
        overdue: { label: 'Overdue', class: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertCircle }
    };

    return (
        <section className="space-y-6">
            <div>
                <h3 className="text-2xl font-black text-white">Invoices</h3>
                <p className="text-sm text-[var(--text-muted)]">View and download your billing history.</p>
            </div>

            <div className="space-y-4">
                {invoices.map((invoice) => {
                    const config = statusConfig[invoice.status as keyof typeof statusConfig] || statusConfig.sent;
                    return (
                        <div
                            key={invoice._id}
                            className="glass-card p-6 border-white/5 hover:bg-white/5 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group"
                        >
                            <div className="flex items-center gap-5">
                                <div className="p-3 bg-white/5 rounded-2xl text-[var(--text-muted)] group-hover:text-indigo-400 transition-colors">
                                    <FileText size={24} />
                                </div>
                                <div>
                                    <div className="font-bold text-lg text-white">{invoice.invoiceNumber}</div>
                                    <div className="flex items-center gap-3 mt-1 text-xs text-[var(--text-muted)]">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            Due {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                                        </div>
                                        <span>•</span>
                                        <div className="font-bold text-[var(--text-primary)]">
                                            {currency(invoice.total, { symbol: invoice.currency }).format()}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Badge className={cn("px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest", config.class)}>
                                    <config.icon size={12} className="mr-1.5" />
                                    {config.label}
                                </Badge>
                                <Button
                                    onClick={() => handleViewInvoice(invoice)}
                                    className="bg-indigo-600 hover:bg-indigo-700 h-11 px-6 rounded-xl font-bold gap-2 text-sm"
                                >
                                    View Invoice
                                    <ArrowRight size={16} />
                                </Button>
                            </div>
                        </div>
                    );
                })}

                {invoices.length === 0 && (
                    <div className="py-20 text-center glass-card border-dashed border-white/10 bg-transparent">
                        <p className="text-[var(--text-muted)]">No invoices issued yet.</p>
                    </div>
                )}
            </div>

            <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
                <DialogContent className="glass-card border-white/10 sm:max-w-[700px] p-0 overflow-hidden">
                    <div className="p-8 space-y-8">
                        <div className="flex justify-between items-start">
                            <div>
                                <h2 className="text-3xl font-black text-white">Invoice</h2>
                                <p className="text-sm text-[var(--text-muted)] mt-1">{selectedInvoice?.invoiceNumber}</p>
                            </div>
                            <Badge className={cn("px-4 py-1.5", selectedInvoice ? statusConfig[selectedInvoice.status as keyof typeof statusConfig]?.class : '')}>
                                {selectedInvoice?.status.toUpperCase()}
                            </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-12">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest">Issue Date</span>
                                    <p className="text-white font-medium">{selectedInvoice && format(new Date(selectedInvoice.issueDate), 'MMM dd, yyyy')}</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest">Due Date</span>
                                    <p className="text-white font-medium">{selectedInvoice && format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')}</p>
                                </div>
                            </div>
                            <div className="space-y-4 text-right">
                                <div className="space-y-1">
                                    <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-widest">Total Amount</span>
                                    <p className="text-3xl font-black text-indigo-400">
                                        {selectedInvoice && currency(selectedInvoice.total, { symbol: selectedInvoice.currency }).format()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="divider" />

                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">Actions</h4>
                            <div className="flex flex-col gap-3">
                                <Button
                                    className="bg-indigo-600 hover:bg-indigo-700 h-14 rounded-2xl font-black text-lg gap-3"
                                    onClick={() => window.open(`/api/projects/${selectedInvoice.projectId}/invoices/${selectedInvoice._id}/pdf`, '_blank')}
                                >
                                    <Download size={22} />
                                    Download PDF
                                </Button>
                                <Button variant="outline" className="glass-card h-14 rounded-2xl border-white/10 text-white font-bold" onClick={() => setSelectedInvoice(null)}>
                                    Close Preview
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </section>
    );
}
