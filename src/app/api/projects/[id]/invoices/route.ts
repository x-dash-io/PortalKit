import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Invoice from '@/lib/models/Invoice';
import User from '@/lib/models/User';
import * as z from 'zod';

import { invoiceSchema } from '@/lib/validation';

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
            .sort({ createdAt: -1 })
            .lean();
        return NextResponse.json(invoices);
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
        const subtotal = validated.lineItems.reduce((acc, item) => acc + (item.quantity * item.rate), 0);
        const taxAmount = subtotal * (validated.taxRate / 100);
        const total = subtotal + taxAmount - validated.discount;

        const invoice = (await Invoice.create({
            ...validated,
            projectId,
            freelancerId: session.user.id,
            invoiceNumber,
            clientName: project.clientName,
            clientEmail: project.clientEmail,
            subtotal,
            total,
            status: 'draft',
        })).toObject() as any;

        delete invoice.__v;

        return NextResponse.json(invoice, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
