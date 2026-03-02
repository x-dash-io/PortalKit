import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';

export async function POST(
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

        invoice.status = 'paid';
        invoice.paidAt = new Date();
        await invoice.save();

        return NextResponse.json({ message: 'Invoice marked as paid' });
    } catch (error) {
        console.error('Mark paid error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
