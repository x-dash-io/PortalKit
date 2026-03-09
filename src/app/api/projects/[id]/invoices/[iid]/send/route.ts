import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';
import Project from '@/lib/models/Project';
import { sendEmail } from '@/lib/email';
import { InvoiceSentEmail } from '@/emails/invoice-sent';
import { PortalAccessEmail } from '@/emails/portal-access';
import User from '@/lib/models/User';
import Notification from '@/lib/models/Notification';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

        const project = await Project.findById(projectId);
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        // Update status
        invoice.status = 'sent';
        invoice.sentAt = new Date();
        await invoice.save();

        await Notification.create({
            freelancerId: session.user.id,
            type: 'INVOICE_SENT',
            projectId,
            metadata: {
                invoiceId: invoice._id.toString(),
                invoiceNumber: invoice.invoiceNumber,
            },
        });

        // Send email via Resend
        try {
            const portalUrl = `${process.env.NEXTAUTH_URL}/portal/${project.portalTokenPrefix}`;

            // 1. Send Invoice-Sent Email
            await sendEmail(
                project.clientEmail,
                `New Invoice ${invoice.invoiceNumber} from ${session.user.name}`,
                InvoiceSentEmail,
                {
                    freelancerName: session.user.name!,
                    invoiceNumber: invoice.invoiceNumber,
                    amount: `${invoice.currency} ${invoice.total.toLocaleString()}`,
                    dueDate: invoice.dueDate.toLocaleDateString(),
                    portalUrl
                }
            );

            // 2. If this is the first invoice/interaction, send portal access email too
            // For now we check if any other invoices are sent
            const sentInvoicesCount = await Invoice.countDocuments({
                projectId,
                status: { $ne: 'draft' },
                _id: { $ne: invoice._id }
            });

            if (sentInvoicesCount === 0) {
                await sendEmail(
                    project.clientEmail,
                    `Your project portal is ready — ${project.title}`,
                    PortalAccessEmail,
                    {
                        projectTitle: project.title,
                        portalUrl
                    }
                );
            }
        } catch (emailError) {
            console.error('Failed to send email:', emailError);
        }

        return NextResponse.json({ message: 'Invoice sent successfully' });
    } catch (error) {
        console.error('Send invoice error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
