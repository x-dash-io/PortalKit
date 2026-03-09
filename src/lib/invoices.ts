import type { InvoiceLineItemRecord } from '@/lib/contracts';

function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function calculateInvoiceTotals(
  lineItems: Pick<InvoiceLineItemRecord, 'quantity' | 'rate'>[],
  taxRate = 0,
  discount = 0
) {
  const normalizedTaxRate = Math.max(0, taxRate);
  const normalizedDiscount = Math.max(0, discount);
  const subtotal = roundCurrency(lineItems.reduce((total, item) => total + item.quantity * item.rate, 0));
  const tax = roundCurrency(subtotal * (normalizedTaxRate / 100));
  const total = roundCurrency(Math.max(subtotal + tax - normalizedDiscount, 0));

  return {
    subtotal,
    tax,
    taxRate: normalizedTaxRate,
    discount: normalizedDiscount,
    total,
  };
}
