import { NextResponse } from 'next/server';
import { validatePortalToken } from '@/lib/portalAuth';
import connectDB from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';
import Notification from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string; iid: string }> }
) {
    try {
        const { token, iid: invoiceId } = await params;
        const project = await validatePortalToken(token);
        if (!project) return NextResponse.json({ message: 'Invalid' }, { status: 404 });

        await connectDB();
        const invoice = await Invoice.findOne({ _id: invoiceId, projectId: project._id });
        if (!invoice) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });

        if (invoice.status === 'sent') {
            invoice.status = 'viewed';
            invoice.viewedAt = new Date();
            await invoice.save();
        }

        await Notification.create({
            freelancerId: project.freelancerId,
            type: 'INVOICE_VIEWED',
            projectId: project._id,
            metadata: {
                invoiceNumber: invoice.invoiceNumber
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
