import { z } from 'zod';

export const projectSchema = z.object({
    title: z.string().min(1, "Title is required").max(100),
    clientName: z.string().min(1, "Client name is required"),
    clientEmail: z.string().email("Invalid client email"),
    description: z.string().optional(),
    status: z.enum(['active', 'completed', 'archived', 'on_hold']).default('active'),
    portalEnabled: z.boolean().default(true),
    requireEmailVerification: z.boolean().default(false),
});

export const invoiceSchema = z.object({
    lineItems: z.array(z.object({
        description: z.string().min(1),
        quantity: z.number().positive(),
        rate: z.number().positive(),
        amount: z.number().positive(),
    })).min(1, "At least one line item is required"),
    taxRate: z.number().min(0).max(100).default(0),
    discount: z.number().min(0).default(0),
    currency: z.string().length(3).default('USD'),
    dueDate: z.string().pipe(z.coerce.date()),
    notes: z.string().optional(),
});

export const approvalSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    type: z.enum(['file', 'milestone', 'design', 'copy', 'other']),
    fileId: z.string().optional(),
});

export const milestoneSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    dueDate: z.string().pipe(z.coerce.date()).optional(),
    status: z.enum(['pending', 'in_progress', 'completed']).default('pending'),
});

export const commentSchema = z.object({
    text: z.string().min(1, "Comment text is required"),
});
