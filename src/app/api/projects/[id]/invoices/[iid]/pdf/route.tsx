import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';
import User from '@/lib/models/User';
import ReactPDF from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/invoices/InvoicePDF';

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
        }).lean();

        if (!invoice) return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });

        const user = await User.findById(session.user.id).lean();

        const stream = await ReactPDF.renderToStream(
            <InvoicePDF invoice={ invoice } freelancer = { user } />
    );

        return new Response(stream as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename=invoice-${invoice.invoiceNumber}.pdf`,
            },
        });
    } catch (error) {
        console.error('PDF generation error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
