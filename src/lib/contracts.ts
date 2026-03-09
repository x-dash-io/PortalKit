export const PROJECT_STATUSES = ['active', 'completed', 'archived'] as const;
export const MILESTONE_STATUSES = ['not_started', 'in_progress', 'in_review', 'complete'] as const;
export const INVOICE_STATUSES = ['draft', 'sent', 'viewed', 'paid', 'overdue'] as const;
export const APPROVAL_TYPES = ['file', 'milestone', 'design', 'copy', 'other'] as const;
export const APPROVAL_STATUSES = ['pending', 'approved', 'changes_requested'] as const;
export const FILE_STATUSES = ['pending', 'active'] as const;
export const APP_THEMES = ['frost', 'obsidian', 'aurora'] as const;
export const USER_PLANS = ['free', 'pro'] as const;
export const NOTIFICATION_TYPES = [
  'PORTAL_VISITED',
  'INVOICE_SENT',
  'INVOICE_VIEWED',
  'INVOICE_PAID',
  'INVOICE_OVERDUE',
  'APPROVAL_REQUESTED',
  'APPROVAL_RESPONDED',
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type MilestoneStatus = (typeof MILESTONE_STATUSES)[number];
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];
export type ApprovalType = (typeof APPROVAL_TYPES)[number];
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number];
export type FileStatus = (typeof FILE_STATUSES)[number];
export type AppTheme = (typeof APP_THEMES)[number];
export type UserPlan = (typeof USER_PLANS)[number];
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export interface EmailPreferences {
  invoiceViewed: boolean;
  approvalResponded: boolean;
  portalVisited: boolean;
  overdueReminders: boolean;
}

export interface MilestoneRecord {
  _id: string;
  title: string;
  status: MilestoneStatus;
  dueDate?: string;
  order: number;
}

export interface ProjectSummary {
  _id: string;
  title: string;
  clientName: string;
  clientEmail: string;
  description?: string;
  status: ProjectStatus;
  portalEnabled: boolean;
  requireEmailVerification: boolean;
  updatedAt: string;
  createdAt: string;
  filesCount: number;
  approvalsCount: number;
  invoicesCount: number;
}

export interface ProjectDetail extends ProjectSummary {
  portalTokenPrefix: string;
  milestones: MilestoneRecord[];
}

export interface FileVersionRecord {
  r2Key: string;
  uploadedAt: string;
  size: number;
}

export interface FileRecord {
  _id: string;
  projectId: string;
  freelancerId: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  folder: string;
  status: FileStatus;
  createdAt: string;
  updatedAt: string;
  versions: FileVersionRecord[];
}

export interface FileListResponse {
  items: FileRecord[];
  nextCursor: string | null;
}

export interface ApprovalCommentRecord {
  _id?: string;
  author: 'freelancer' | 'client';
  text: string;
  createdAt: string;
}

export interface ApprovalRecord {
  _id: string;
  projectId: string;
  freelancerId: string;
  title: string;
  description?: string;
  type: ApprovalType;
  status: ApprovalStatus;
  comments: ApprovalCommentRecord[];
  createdAt: string;
  updatedAt: string;
  file?: Pick<FileRecord, '_id' | 'name' | 'originalName' | 'mimeType' | 'size'> | null;
}

export interface InvoiceLineItemRecord {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceRecord {
  _id: string;
  projectId: string;
  freelancerId: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  lineItems: InvoiceLineItemRecord[];
  subtotal: number;
  tax: number;
  taxRate: number;
  discount: number;
  total: number;
  currency: string;
  clientName: string;
  clientEmail: string;
  issueDate: string;
  dueDate: string;
  paidAt?: string;
  notes?: string;
  sentAt?: string;
  viewedAt?: string;
  overdueNotified: boolean;
  createdAt: string;
}

export interface NotificationProjectRef {
  _id: string;
  title: string;
}

export interface NotificationRecord {
  _id: string;
  freelancerId: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  project?: NotificationProjectRef | null;
  metadata?: Record<string, unknown>;
}

export interface PortalPayload {
  theme: AppTheme;
  freelancerName: string;
  project: ProjectDetail;
  approvals: ApprovalRecord[];
  invoices: InvoiceRecord[];
  files: FileRecord[];
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  logo?: string;
  accentColor?: string;
  theme: AppTheme;
  plan: UserPlan;
  storageUsed: number;
  emailPreferences: EmailPreferences;
}

export interface SettingsPayload {
  theme?: AppTheme;
  profile?: Partial<Pick<UserProfile, 'name' | 'avatar' | 'logo' | 'accentColor'>>;
  emailPreferences?: Partial<EmailPreferences>;
}

export const DEFAULT_EMAIL_PREFERENCES: EmailPreferences = {
  invoiceViewed: true,
  approvalResponded: true,
  portalVisited: false,
  overdueReminders: true,
};

export const DEFAULT_THEME: AppTheme = 'frost';
