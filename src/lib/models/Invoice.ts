import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface ILineItem {
    description: string;
    quantity: number;
    rate: number;
    amount: number;
}

export interface IInvoice extends Document {
    projectId: Types.ObjectId;
    freelancerId: Types.ObjectId;
    invoiceNumber: string;
    status: 'draft' | 'sent' | 'viewed' | 'paid' | 'overdue';
    lineItems: ILineItem[];
    subtotal: number;
    tax: number;
    taxRate: number;
    discount: number;
    total: number;
    currency: string;
    clientName: string;
    clientEmail: string;
    dueDate: Date;
    paidAt?: Date;
    notes?: string;
    sentAt?: Date;
    viewedAt?: Date;
    overdueNotified: boolean;
    createdAt: Date;
}

const LineItemSchema = new Schema<ILineItem>({
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    rate: { type: Number, required: true },
    amount: { type: Number, required: true },
});

const InvoiceSchema = new Schema<IInvoice>(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
        freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        invoiceNumber: { type: String, required: true },
        status: {
            type: String,
            enum: ['draft', 'sent', 'viewed', 'paid', 'overdue'],
            default: 'draft',
        },
        lineItems: [LineItemSchema],
        subtotal: { type: Number, required: true },
        tax: { type: Number, default: 0 },
        taxRate: { type: Number, default: 0 },
        discount: { type: Number, default: 0 },
        total: { type: Number, required: true },
        currency: { type: String, default: 'USD' },
        clientName: { type: String, required: true },
        clientEmail: { type: String, required: true },
        dueDate: { type: Date, required: true },
        paidAt: { type: Date },
        notes: { type: String },
        sentAt: { type: Date },
        viewedAt: { type: Date },
        overdueNotified: { type: Boolean, default: false },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

InvoiceSchema.index({ projectId: 1 });

const Invoice: Model<IInvoice> = mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);
export default Invoice;
