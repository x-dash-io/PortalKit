import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Invoice from '@/lib/models/Invoice';
import Project from '@/lib/models/Project';
import Notification from '@/lib/models/Notification';
import { sendEmail } from '@/lib/email';
import { OverdueReminderEmail } from '@/emails/overdue-reminder';
import { differenceInDays, startOfDay } from 'date-fns';
import type { IUser } from '@/lib/models/User';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('x-cron-secret');
    if (authHeader !== process.env.CRON_SECRET) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        await connectDB();

        const today = startOfDay(new Date());

        // Find invoices that are sent or viewed, past due, and haven't been notified yet
        const overdueInvoices = await Invoice.find({
            status: { $in: ['sent', 'viewed'] },
            dueDate: { $lt: today },
            overdueNotified: { $ne: true }
        }).populate('freelancerId');

        let notifiedCount = 0;

        for (const invoice of overdueInvoices) {
            const freelancer = invoice.freelancerId as unknown as IUser | null;
            if (!freelancer) continue;

            const daysOverdue = differenceInDays(today, new Date(invoice.dueDate));
            const project = await Project.findById(invoice.projectId);
            if (!project) continue;

            const fullPortalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/portal/${project.portalTokenPrefix}`;

            // 1. Create Notification for freelancer
            await Notification.create({
                freelancerId: freelancer._id,
                type: 'INVOICE_OVERDUE',
                projectId: project._id,
                metadata: {
                    invoiceId: invoice._id,
                    invoiceNumber: invoice.invoiceNumber,
                    daysOverdue
                }
            });

            // 2. Send email to client if enabled by freelancer
            if (freelancer.emailPreferences?.overdueReminders !== false) {
                await sendEmail(
                    invoice.clientEmail,
                    `Action Required: Invoice ${invoice.invoiceNumber} is Overdue`,
                    OverdueReminderEmail,
                    {
                        invoiceNumber: invoice.invoiceNumber,
                        amount: `${invoice.currency} ${invoice.total.toLocaleString()}`,
                        daysOverdue,
                        portalUrl: fullPortalUrl
                    }
                );
            }

            // 3. Mark as notified so we don't spam
            invoice.overdueNotified = true;
            invoice.status = 'overdue';
            await invoice.save();

            notifiedCount++;
        }

        return NextResponse.json({
            message: 'Cron job completed',
            count: notifiedCount
        });
    } catch (error) {
        console.error('Cron job error:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
