import test from 'node:test';
import assert from 'node:assert/strict';
import {
  INVOICE_STATUSES,
  MILESTONE_STATUSES,
  NOTIFICATION_TYPES,
  PROJECT_STATUSES,
} from '../src/lib/contracts';
import { calculateInvoiceTotals } from '../src/lib/invoices';
import { getNotificationMessage, isNotificationType } from '../src/lib/notifications';
import { approvalResponseSchema, invoiceSchema, projectSchema } from '../src/lib/validation';

test('canonical contract enums remain stable', () => {
  assert.deepEqual(PROJECT_STATUSES, ['active', 'completed', 'archived']);
  assert.deepEqual(MILESTONE_STATUSES, ['not_started', 'in_progress', 'in_review', 'complete']);
  assert.deepEqual(INVOICE_STATUSES, ['draft', 'sent', 'viewed', 'paid', 'overdue']);
  assert.deepEqual(NOTIFICATION_TYPES, [
    'PORTAL_VISITED',
    'INVOICE_SENT',
    'INVOICE_VIEWED',
    'INVOICE_PAID',
    'INVOICE_OVERDUE',
    'APPROVAL_REQUESTED',
    'APPROVAL_RESPONDED',
  ]);
});

test('validation schemas accept the canonical statuses', () => {
  const project = projectSchema.parse({
    title: 'Portal redesign',
    clientName: 'Acme',
    clientEmail: 'client@example.com',
    status: 'active',
  });
  const invoice = invoiceSchema.parse({
    issueDate: '2026-03-09',
    dueDate: '2026-03-20',
    lineItems: [{ description: 'Design sprint', quantity: 2, rate: 1200 }],
    status: 'draft',
  });
  const approval = approvalResponseSchema.parse({
    status: 'approved',
    comment: 'Looks good',
  });

  assert.equal(project.status, 'active');
  assert.equal(invoice.status, 'draft');
  assert.equal(approval.status, 'approved');
});

test('invoice totals are calculated server-side in a stable way', () => {
  const totals = calculateInvoiceTotals(
    [
      { quantity: 2, rate: 1500 },
      { quantity: 1, rate: 249.99 },
    ],
    16,
    100
  );

  assert.deepEqual(totals, {
    subtotal: 3249.99,
    tax: 520,
    taxRate: 16,
    discount: 100,
    total: 3669.99,
  });
});

test('notification mapping stays uppercase and human readable', () => {
  assert.equal(isNotificationType('APPROVAL_RESPONDED'), true);
  assert.equal(isNotificationType('approval_responded'), false);
  assert.equal(
    getNotificationMessage('INVOICE_OVERDUE', 'Brand Refresh'),
    'Invoice for Brand Refresh is overdue'
  );
});
