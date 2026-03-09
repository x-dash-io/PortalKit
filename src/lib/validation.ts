import { z } from 'zod';
import {
    APPROVAL_STATUSES,
    APPROVAL_TYPES,
    APP_THEMES,
    DEFAULT_EMAIL_PREFERENCES,
    INVOICE_STATUSES,
    MILESTONE_STATUSES,
    PROJECT_STATUSES,
} from '@/lib/contracts';

export const projectSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    clientName: z.string().min(1, "Client name is required"),
    clientEmail: z.string().email("Invalid client email"),
    description: z.string().optional(),
    status: z.enum(PROJECT_STATUSES).default('active'),
    portalEnabled: z.boolean().default(true),
    requireEmailVerification: z.boolean().default(false),
});

export const invoiceSchema = z.object({
    issueDate: z.string().pipe(z.coerce.date()),
    lineItems: z.array(z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        rate: z.number().positive(),
        amount: z.number().nonnegative().optional(),
    })).min(1, "At least one line item is required"),
    taxRate: z.number().min(0).max(100).default(0),
    discount: z.number().min(0).default(0),
    currency: z.string().length(3).default('USD'),
    dueDate: z.string().pipe(z.coerce.date()),
    notes: z.string().optional(),
    status: z.enum(INVOICE_STATUSES).optional(),
});

export const approvalSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.enum(APPROVAL_TYPES),
    fileId: z.string().optional(),
});

export const milestoneSchema = z.object({
    title: z.string().min(1, "Title is required"),
    dueDate: z.string().pipe(z.coerce.date()).optional(),
    status: z.enum(MILESTONE_STATUSES).default('not_started'),
    order: z.number().int().nonnegative().optional(),
});

export const commentSchema = z.object({
    text: z.string().min(1, "Comment text is required"),
});

export const emailPreferencesSchema = z.object({
    invoiceViewed: z.boolean().default(DEFAULT_EMAIL_PREFERENCES.invoiceViewed),
    approvalResponded: z.boolean().default(DEFAULT_EMAIL_PREFERENCES.approvalResponded),
    portalVisited: z.boolean().default(DEFAULT_EMAIL_PREFERENCES.portalVisited),
    overdueReminders: z.boolean().default(DEFAULT_EMAIL_PREFERENCES.overdueReminders),
});

export const settingsSchema = z.object({
    theme: z.enum(APP_THEMES).optional(),
    profile: z.object({
        name: z.string().min(2).max(100).optional(),
        avatar: z.string().url().optional().or(z.literal('')),
        logo: z.string().url().optional().or(z.literal('')),
        accentColor: z.string().regex(/^#?[0-9a-fA-F]{6}$/).optional().or(z.literal('')),
    }).partial().optional(),
    emailPreferences: emailPreferencesSchema.partial().optional(),
});

export const approvalResponseSchema = z.object({
    status: z.enum(APPROVAL_STATUSES).refine((value) => value !== 'pending', {
        message: 'Invalid approval response status',
    }),
    comment: z.string().trim().optional(),
});
