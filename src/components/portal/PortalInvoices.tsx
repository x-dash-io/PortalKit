'use client';

import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import type { InvoiceRecord } from '@/lib/contracts';

interface PortalInvoicesProps {
  invoices: InvoiceRecord[];
  token: string;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function PortalInvoices({ invoices, token }: PortalInvoicesProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  const handleViewInvoice = async (invoice: InvoiceRecord) => {
    setSelectedInvoice(invoice);
    void fetch(`/api/portal/${token}/invoices/${invoice._id}/view`, { method: 'POST' });
  };

  const statusConfig = {
    draft: { label: 'Draft', class: 'bg-slate-100 text-slate-700', icon: FileText },
    sent: { label: 'Unpaid', class: 'bg-amber-50 text-amber-700', icon: Clock },
    viewed: { label: 'Viewed', class: 'bg-blue-50 text-blue-700', icon: CheckCircle2 },
    paid: { label: 'Paid', class: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
    overdue: { label: 'Overdue', class: 'bg-red-50 text-red-700', icon: AlertCircle },
  } as const;

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Invoices</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Review billing history and download invoice PDFs.</p>
      </div>

      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div className="glass-card rounded-[2rem] border border-dashed border-[var(--border-subtle)] bg-transparent py-20 text-center text-[var(--text-secondary)]">
            No invoices issued yet.
          </div>
        ) : (
          invoices.map((invoice) => {
            const config = statusConfig[invoice.status];

            return (
              <div
                key={invoice._id}
                className="glass-card flex flex-col gap-6 rounded-[2rem] p-6 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-center gap-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--muted)] text-[var(--text-secondary)]">
                    <FileText size={24} />
                  </div>
                  <div>
                    <div className="text-lg font-medium text-[var(--text-primary)]">{invoice.invoiceNumber}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[var(--text-muted)]">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} />
                        Due {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}
                      </div>
                      <span>{formatMoney(invoice.total, invoice.currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <Badge className={cn('rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em]', config.class)}>
                    <config.icon size={12} className="mr-1.5" />
                    {config.label}
                  </Badge>
                  <Button className="rounded-2xl px-5" onClick={() => handleViewInvoice(invoice)}>
                    View invoice
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="rounded-[2rem] border-[var(--border-subtle)] bg-[var(--surface)] p-0 shadow-[var(--shadow-soft)] sm:max-w-[720px]">
          <div className="space-y-8 p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Invoice</h2>
                <p className="mt-1 text-sm text-[var(--text-secondary)]">{selectedInvoice?.invoiceNumber}</p>
              </div>
              {selectedInvoice && (
                <Badge className={cn('rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em]', statusConfig[selectedInvoice.status].class)}>
                  {statusConfig[selectedInvoice.status].label}
                </Badge>
              )}
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <MetaItem label="Issue date" value={selectedInvoice ? format(new Date(selectedInvoice.issueDate), 'MMM dd, yyyy') : ''} />
                <MetaItem label="Due date" value={selectedInvoice ? format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy') : ''} />
              </div>
              <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface)] p-5 text-right">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">Total amount</p>
                <p className="mt-3 text-3xl font-semibold tracking-tight text-[var(--text-primary)]">
                  {selectedInvoice ? formatMoney(selectedInvoice.total, selectedInvoice.currency) : ''}
                </p>
              </div>
            </div>

            <div className="space-y-4 rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
              <h4 className="text-sm font-medium text-[var(--text-primary)]">Actions</h4>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button
                  className="h-12 flex-1 rounded-2xl"
                  onClick={() => {
                    if (!selectedInvoice) return;
                    window.open(`/api/portal/${token}/invoices/${selectedInvoice._id}/pdf`, '_blank');
                  }}
                >
                  <Download size={16} />
                  Download PDF
                </Button>
                <Button
                  variant="outline"
                  className="h-12 flex-1 rounded-2xl border-[var(--border-subtle)]"
                  onClick={() => setSelectedInvoice(null)}
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-[var(--border-subtle)] bg-[var(--surface)] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--text-muted)]">{label}</p>
      <p className="mt-2 text-base font-medium text-[var(--text-primary)]">{value}</p>
    </div>
  );
}
