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
import { Dialog, DialogContent } from '@/components/ui/dialog';
import type { InvoiceRecord } from '@/lib/contracts';
import { toast } from 'sonner';

interface PortalInvoicesProps {
  invoices: InvoiceRecord[];
  token: string;
}

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

const STATUS_CONFIG = {
  draft:   { label: 'Draft',   icon: FileText,    color: 'var(--text-muted)',    bg: 'var(--surface-muted)' },
  sent:    { label: 'Unpaid',  icon: Clock,       color: 'var(--warning)',       bg: 'rgba(245,158,11,0.12)' },
  viewed:  { label: 'Viewed',  icon: CheckCircle2,color: 'var(--accent)',        bg: 'var(--accent-light)' },
  paid:    { label: 'Paid',    icon: CheckCircle2,color: 'var(--success)',       bg: 'var(--success-bg)' },
  overdue: { label: 'Overdue', icon: AlertCircle, color: 'var(--destructive)',   bg: 'var(--destructive-bg)' },
} as const;

export function PortalInvoices({ invoices, token }: PortalInvoicesProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceRecord | null>(null);

  const handleViewInvoice = async (invoice: InvoiceRecord) => {
    setSelectedInvoice(invoice);
    void fetch(`/api/portal/${token}/invoices/${invoice._id}/view`, { method: 'POST' });
  };

  const handleDownloadPdf = (invoiceId: string) => {
    window.open(`/api/portal/${token}/invoices/${invoiceId}/pdf`, '_blank');
    toast.success('Opening PDF…');
  };

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Invoices</h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Review billing history and download invoice PDFs.</p>
      </div>

      <div className="space-y-4">
        {invoices.length === 0 ? (
          <div
            className="glass-card rounded-[2rem] py-20 text-center"
            style={{ border: '2px dashed var(--border-subtle)', color: 'var(--text-secondary)' }}
          >
            No invoices issued yet.
          </div>
        ) : (
          invoices.map((invoice) => {
            const cfg = STATUS_CONFIG[invoice.status];
            const Icon = cfg.icon;
            return (
              <div
                key={invoice._id}
                className="glass-card flex flex-col gap-4 rounded-[2rem] p-6 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-5">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-3xl shrink-0"
                    style={{ background: 'var(--surface-muted)', color: 'var(--text-secondary)' }}
                  >
                    <FileText size={24} />
                  </div>
                  <div>
                    <div className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{invoice.invoiceNumber}</div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                      <span className="flex items-center gap-1.5"><Calendar size={12} />Due {format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</span>
                      <span className="font-semibold" style={{ color: 'var(--text-secondary)' }}>{formatMoney(invoice.total, invoice.currency)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
                    style={{ background: cfg.bg, color: cfg.color }}
                  >
                    <Icon size={12} />
                    {cfg.label}
                  </span>
                  <button
                    className="flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-semibold transition-all hover:opacity-90"
                    style={{ background: 'var(--accent-gradient)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow-sm)' }}
                    onClick={() => void handleViewInvoice(invoice)}
                  >
                    View invoice <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent
          className="rounded-[2rem] p-0 overflow-hidden sm:max-w-[680px]"
          style={{ background: 'var(--surface)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-modal)' }}
        >
          <div className="h-1" style={{ background: 'var(--accent-gradient)' }} />
          {selectedInvoice && (
            <div className="p-8 space-y-8">
              {/* Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>Invoice</h2>
                  <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>{selectedInvoice.invoiceNumber}</p>
                </div>
                {(() => {
                  const cfg = STATUS_CONFIG[selectedInvoice.status];
                  const Icon = cfg.icon;
                  return (
                    <span
                      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-wide"
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      <Icon size={12} />{cfg.label}
                    </span>
                  );
                })()}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl p-4" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Issue Date</p>
                  <p className="mt-1.5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {format(new Date(selectedInvoice.issueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
                <div className="rounded-xl p-4" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Due Date</p>
                  <p className="mt-1.5 text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                    {format(new Date(selectedInvoice.dueDate), 'MMM dd, yyyy')}
                  </p>
                </div>
              </div>

              {/* Line items */}
              {selectedInvoice.lineItems?.length > 0 && (
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-subtle)' }}>
                  <div className="grid grid-cols-12 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest" style={{ background: 'var(--surface-muted)', color: 'var(--text-muted)' }}>
                    <span className="col-span-6">Description</span>
                    <span className="col-span-2 text-right">Qty</span>
                    <span className="col-span-2 text-right">Rate</span>
                    <span className="col-span-2 text-right">Amount</span>
                  </div>
                  {selectedInvoice.lineItems.map((item, i) => (
                    <div key={i} className="grid grid-cols-12 px-4 py-3 text-sm" style={{ borderTop: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}>
                      <span className="col-span-6" style={{ color: 'var(--text-secondary)' }}>{item.description}</span>
                      <span className="col-span-2 text-right">{item.quantity}</span>
                      <span className="col-span-2 text-right">{formatMoney(item.rate, selectedInvoice.currency)}</span>
                      <span className="col-span-2 text-right font-semibold">{formatMoney(item.amount, selectedInvoice.currency)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Totals */}
              <div className="space-y-2 rounded-xl p-4" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}>
                {selectedInvoice.taxRate > 0 && (
                  <>
                    <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span>Subtotal</span>
                      <span>{formatMoney(selectedInvoice.subtotal, selectedInvoice.currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm" style={{ color: 'var(--text-secondary)' }}>
                      <span>Tax ({selectedInvoice.taxRate}%)</span>
                      <span>{formatMoney(selectedInvoice.tax, selectedInvoice.currency)}</span>
                    </div>
                  </>
                )}
                {selectedInvoice.discount > 0 && (
                  <div className="flex justify-between text-sm" style={{ color: 'var(--success)' }}>
                    <span>Discount</span>
                    <span>-{formatMoney(selectedInvoice.discount, selectedInvoice.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2" style={{ borderTop: '1px solid var(--border-medium)', color: 'var(--text-primary)' }}>
                  <span>Total</span>
                  <span style={{ color: 'var(--accent)' }}>{formatMoney(selectedInvoice.total, selectedInvoice.currency)}</span>
                </div>
              </div>

              {/* Notes */}
              {selectedInvoice.notes && (
                <div className="rounded-xl p-4" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}>
                  <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Notes</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selectedInvoice.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all hover:opacity-90"
                  style={{ background: 'var(--accent-gradient)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow-sm)' }}
                  onClick={() => handleDownloadPdf(selectedInvoice._id)}
                >
                  <Download size={15} />
                  Download PDF
                </button>
                <button
                  className="flex flex-1 items-center justify-center rounded-2xl py-3 text-sm font-semibold transition-all hover:bg-[var(--surface-hover)]"
                  style={{ background: 'var(--surface)', border: '1px solid var(--border-medium)', color: 'var(--text-secondary)' }}
                  onClick={() => setSelectedInvoice(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
