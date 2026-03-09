import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Invoice from '@/lib/models/Invoice';
import { invoiceSchema } from '@/lib/validation';
import { serializeInvoiceRecord } from '@/lib/serializers';
import * as z from 'zod';
import { calculateInvoiceTotals } from '@/lib/invoices';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string; iid: string }> }
) {
    try {
        const { id: projectId, iid: invoiceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const invoice = await Invoice.findOne({
            _id: invoiceId,
            projectId,
            freelancerId: session.user.id
        }).select('-__v').lean();

        if (!invoice) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });

        return NextResponse.json(serializeInvoiceRecord(invoice));
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; iid: string }> }
) {
    try {
        const { id: projectId, iid: invoiceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const validated = invoiceSchema.partial().parse(body);

        await connectDB();
        const invoice = await Invoice.findOne({
            _id: invoiceId,
            projectId,
            freelancerId: session.user.id
        });

        if (!invoice) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
        if (invoice.status !== 'draft') {
            return NextResponse.json({ message: 'Only drafts can be edited' }, { status: 403 });
        }

        if (validated.lineItems || validated.taxRate !== undefined || validated.discount !== undefined) {
            const lineItems = validated.lineItems ?? invoice.lineItems;
            const taxRate = validated.taxRate ?? invoice.taxRate;
            const discount = validated.discount ?? invoice.discount;
            const totals = calculateInvoiceTotals(lineItems, taxRate, discount);

            invoice.subtotal = totals.subtotal;
            invoice.tax = totals.tax;
            invoice.total = totals.total;
        }

        Object.assign(invoice, validated);
        await invoice.save();

        return NextResponse.json(serializeInvoiceRecord(invoice.toObject()));
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0]?.message ?? 'Invalid invoice update' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; iid: string }> }
) {
    try {
        const { id: projectId, iid: invoiceId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const invoice = await Invoice.findOne({
            _id: invoiceId,
            projectId,
            freelancerId: session.user.id
        });

        if (!invoice) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
        if (invoice.status !== 'draft') {
            return NextResponse.json({ message: 'Only drafts can be deleted' }, { status: 403 });
        }

        await Invoice.deleteOne({ _id: invoiceId });
        return NextResponse.json({ message: 'Invoice deleted' });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
