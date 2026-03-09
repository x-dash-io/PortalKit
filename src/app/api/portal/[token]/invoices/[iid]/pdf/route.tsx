import { NextResponse } from 'next/server';
import ReactPDF from '@react-pdf/renderer';
import type { ReactElement } from 'react';
import type { DocumentProps } from '@react-pdf/renderer';
import { validatePortalToken } from '@/lib/portalAuth';
import connectDB from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';
import User from '@/lib/models/User';
import { InvoicePDF } from '@/components/invoices/InvoicePDF';
import { serializeInvoiceRecord } from '@/lib/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ token: string; iid: string }> }
) {
  try {
    const { token, iid: invoiceId } = await params;
    const project = await validatePortalToken(token);

    if (!project) {
      return NextResponse.json({ message: 'Invalid portal link' }, { status: 404 });
    }

    await connectDB();

    const invoice = await Invoice.findOne({ _id: invoiceId, projectId: project._id }).lean();
    if (!invoice) {
      return NextResponse.json({ message: 'Invoice not found' }, { status: 404 });
    }

    const freelancer = await User.findById(project.freelancerId).lean();

    const stream = await ReactPDF.renderToStream(
      <InvoicePDF invoice={serializeInvoiceRecord(invoice)} freelancer={freelancer} /> as ReactElement<DocumentProps>
    );

    return new Response(stream as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename=invoice-${invoice.invoiceNumber}.pdf`,
      },
    });
  } catch (error) {
    console.error('Portal PDF generation error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
