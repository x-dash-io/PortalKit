import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Invoice from '@/lib/models/Invoice';
import { invoiceSchema } from '@/lib/validation';

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

        return NextResponse.json(invoice);
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

        // Recalculate totals if line items changed
        if (validated.lineItems) {
            const subtotal = validated.lineItems.reduce((acc: number, item: any) => acc + (item.quantity * item.rate), 0);
            const taxRate = validated.taxRate ?? invoice.taxRate;
            const discount = validated.discount ?? invoice.discount;
            const taxAmount = subtotal * (taxRate / 100);
            (validated as any).subtotal = subtotal;
            (validated as any).total = subtotal + taxAmount - discount;
        }

        Object.assign(invoice, validated);
        await invoice.save();

        const sanitized = invoice.toObject();
        delete (sanitized as any).__v;

        return NextResponse.json(sanitized);
    } catch (error) {
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
