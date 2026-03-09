import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Invoice from '@/lib/models/Invoice';
import User from '@/lib/models/User';
import { serializeInvoiceRecord } from '@/lib/serializers';
import * as z from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { invoiceSchema } from '@/lib/validation';
import { calculateInvoiceTotals } from '@/lib/invoices';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const project = await Project.findOne({ _id: projectId, freelancerId: session.user.id });
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        const invoices = await Invoice.find({ projectId })
            .select('-__v')
            .sort({ createdAt: -1, issueDate: -1 })
            .lean();
        return NextResponse.json(invoices.map((invoice) => serializeInvoiceRecord(invoice)));
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const validated = invoiceSchema.parse(body);

        await connectDB();
        const project = await Project.findOne({ _id: projectId, freelancerId: session.user.id });
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        // Atomic invoice number generation
        const user = await User.findByIdAndUpdate(
            session.user.id,
            { $inc: { lastInvoiceNumber: 1 } },
            { new: true, select: 'lastInvoiceNumber' }
        );

        const invoiceNumber = `INV-${String(user!.lastInvoiceNumber).padStart(4, '0')}`;

        // Calculate totals server-side for safety
        const totals = calculateInvoiceTotals(validated.lineItems, validated.taxRate, validated.discount);

        const invoice = (await Invoice.create({
            ...validated,
            issueDate: validated.issueDate,
            projectId,
            freelancerId: session.user.id,
            invoiceNumber,
            clientName: project.clientName,
            clientEmail: project.clientEmail,
            subtotal: totals.subtotal,
            tax: totals.tax,
            total: totals.total,
            status: 'draft',
        })).toObject();

        return NextResponse.json(serializeInvoiceRecord(invoice), { status: 201 });
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
