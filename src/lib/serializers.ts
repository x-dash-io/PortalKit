import type {
  ApprovalCommentRecord,
  ApprovalRecord,
  FileListResponse,
  FileRecord,
  FileVersionRecord,
  InvoiceLineItemRecord,
  InvoiceRecord,
  NotificationRecord,
  NotificationType,
  PortalPayload,
  ProjectDetail,
  ProjectSummary,
} from '@/lib/contracts';
import { DEFAULT_THEME } from '@/lib/contracts';

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function objectIdToString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object' && 'toString' in value && typeof value.toString === 'function') {
    return value.toString();
  }
  return '';
}

function toIsoString(value: unknown): string {
  if (typeof value === 'string') {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value && typeof value === 'object' && 'toString' in value) {
    const date = new Date(String(value));
    if (!Number.isNaN(date.getTime())) return date.toISOString();
  }

  return new Date().toISOString();
}

function toNumber(value: unknown): number {
  return typeof value === 'number' ? value : Number(value ?? 0);
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function toOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function serializeMilestone(value: unknown): ProjectDetail['milestones'][number] {
  const record = asRecord(value);

  return {
    _id: objectIdToString(record._id),
    title: toStringValue(record.title),
    status: (record.status as ProjectDetail['milestones'][number]['status']) ?? 'not_started',
    dueDate: record.dueDate ? toIsoString(record.dueDate) : undefined,
    order: toNumber(record.order),
  };
}

export function serializeProjectSummary(
  value: unknown,
  counts?: { files?: number; approvals?: number; invoices?: number }
): ProjectSummary {
  const record = asRecord(value);

  return {
    _id: objectIdToString(record._id),
    title: toStringValue(record.title),
    clientName: toStringValue(record.clientName),
    clientEmail: toStringValue(record.clientEmail),
    description: toOptionalString(record.description),
    status: (record.status as ProjectSummary['status']) ?? 'active',
    portalEnabled: record.portalEnabled !== false,
    requireEmailVerification: record.requireEmailVerification === true,
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt ?? record.createdAt),
    filesCount: counts?.files ?? 0,
    approvalsCount: counts?.approvals ?? 0,
    invoicesCount: counts?.invoices ?? 0,
  };
}

export function serializeProjectDetail(
  value: unknown,
  counts?: { files?: number; approvals?: number; invoices?: number }
): ProjectDetail {
  const record = asRecord(value);

  return {
    ...serializeProjectSummary(record, counts),
    portalTokenPrefix: toStringValue(record.portalTokenPrefix),
    milestones: Array.isArray(record.milestones) ? record.milestones.map((milestone) => serializeMilestone(milestone)) : [],
  };
}

export function serializeFileVersion(value: unknown): FileVersionRecord {
  const record = asRecord(value);

  return {
    r2Key: toStringValue(record.r2Key),
    uploadedAt: toIsoString(record.uploadedAt),
    size: toNumber(record.size),
  };
}

export function serializeFileRecord(value: unknown): FileRecord {
  const record = asRecord(value);

  return {
    _id: objectIdToString(record._id),
    projectId: objectIdToString(record.projectId),
    freelancerId: objectIdToString(record.freelancerId),
    name: toStringValue(record.name || record.originalName),
    originalName: toStringValue(record.originalName || record.name),
    mimeType: toStringValue(record.mimeType),
    size: toNumber(record.size),
    folder: toStringValue(record.folder, 'Root'),
    status: (record.status as FileRecord['status']) ?? 'active',
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt ?? record.createdAt),
    versions: Array.isArray(record.versions) ? record.versions.map((version) => serializeFileVersion(version)) : [],
  };
}

export function serializeApprovalComment(value: unknown): ApprovalCommentRecord {
  const record = asRecord(value);

  return {
    _id: record._id ? objectIdToString(record._id) : undefined,
    author: record.author === 'client' ? 'client' : 'freelancer',
    text: toStringValue(record.text),
    createdAt: toIsoString(record.createdAt),
  };
}

export function serializeApprovalRecord(value: unknown): ApprovalRecord {
  const record = asRecord(value);
  const fileValue =
    record.fileId && typeof record.fileId === 'object' ? (record.fileId as Record<string, unknown>) : null;

  return {
    _id: objectIdToString(record._id),
    projectId: objectIdToString(record.projectId),
    freelancerId: objectIdToString(record.freelancerId),
    title: toStringValue(record.title),
    description: toOptionalString(record.description),
    type: (record.type as ApprovalRecord['type']) ?? 'file',
    status: (record.status as ApprovalRecord['status']) ?? 'pending',
    comments: Array.isArray(record.comments)
      ? record.comments.map((comment) => serializeApprovalComment(comment))
      : [],
    createdAt: toIsoString(record.createdAt),
    updatedAt: toIsoString(record.updatedAt ?? record.createdAt),
    file: fileValue
      ? {
          _id: objectIdToString(fileValue._id),
          name: toStringValue(fileValue.name || fileValue.originalName),
          originalName: toStringValue(fileValue.originalName || fileValue.name),
          mimeType: toStringValue(fileValue.mimeType),
          size: toNumber(fileValue.size),
        }
      : null,
  };
}

export function serializeInvoiceLineItem(value: unknown): InvoiceLineItemRecord {
  const record = asRecord(value);
  const quantity = toNumber(record.quantity);
  const rate = toNumber(record.rate);
  const amount = record.amount !== undefined ? toNumber(record.amount) : quantity * rate;

  return {
    description: toStringValue(record.description),
    quantity,
    rate,
    amount,
  };
}

export function serializeInvoiceRecord(value: unknown): InvoiceRecord {
  const record = asRecord(value);

  return {
    _id: objectIdToString(record._id),
    projectId: objectIdToString(record.projectId),
    freelancerId: objectIdToString(record.freelancerId),
    invoiceNumber: toStringValue(record.invoiceNumber),
    status: (record.status as InvoiceRecord['status']) ?? 'draft',
    lineItems: Array.isArray(record.lineItems)
      ? record.lineItems.map((lineItem) => serializeInvoiceLineItem(lineItem))
      : [],
    subtotal: toNumber(record.subtotal),
    tax: toNumber(record.tax),
    taxRate: toNumber(record.taxRate),
    discount: toNumber(record.discount),
    total: toNumber(record.total),
    currency: toStringValue(record.currency, 'USD'),
    clientName: toStringValue(record.clientName),
    clientEmail: toStringValue(record.clientEmail),
    issueDate: toIsoString(record.issueDate ?? record.createdAt),
    dueDate: toIsoString(record.dueDate),
    paidAt: record.paidAt ? toIsoString(record.paidAt) : undefined,
    notes: toOptionalString(record.notes),
    sentAt: record.sentAt ? toIsoString(record.sentAt) : undefined,
    viewedAt: record.viewedAt ? toIsoString(record.viewedAt) : undefined,
    overdueNotified: record.overdueNotified === true,
    createdAt: toIsoString(record.createdAt),
  };
}

export function serializeNotificationRecord(value: unknown): NotificationRecord {
  const record = asRecord(value);
  const projectValue =
    record.projectId && typeof record.projectId === 'object' ? (record.projectId as Record<string, unknown>) : null;

  return {
    _id: objectIdToString(record._id),
    freelancerId: objectIdToString(record.freelancerId),
    type: (record.type as NotificationType) ?? 'PORTAL_VISITED',
    read: record.read === true,
    createdAt: toIsoString(record.createdAt),
    project: projectValue
      ? {
          _id: objectIdToString(projectValue._id),
          title: toStringValue(projectValue.title),
        }
      : null,
    metadata:
      record.metadata && typeof record.metadata === 'object'
        ? (record.metadata as Record<string, unknown>)
        : undefined,
  };
}

export function serializePortalPayload(input: {
  theme?: string;
  freelancerName?: string;
  project: unknown;
  approvals: unknown[];
  invoices: unknown[];
  files: unknown[];
  counts?: { approvals?: number; files?: number; invoices?: number };
}): PortalPayload {
  return {
    theme: (input.theme as PortalPayload['theme']) ?? DEFAULT_THEME,
    freelancerName: input.freelancerName ?? 'Your Freelancer',
    project: serializeProjectDetail(input.project, {
      approvals: input.counts?.approvals,
      files: input.counts?.files,
      invoices: input.counts?.invoices,
    }),
    approvals: input.approvals.map((approval) => serializeApprovalRecord(approval)),
    invoices: input.invoices.map((invoice) => serializeInvoiceRecord(invoice)),
    files: input.files.map((file) => serializeFileRecord(file)),
  };
}

export function serializeFileListResponse(input: {
  items: unknown[];
  nextCursor: unknown;
}): FileListResponse {
  return {
    items: input.items.map((item) => serializeFileRecord(item)),
    nextCursor: input.nextCursor ? objectIdToString(input.nextCursor) : null,
  };
}
