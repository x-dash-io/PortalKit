import { NextResponse } from 'next/server';
import { validatePortalToken } from '@/lib/portalAuth';
import connectDB from '@/lib/mongodb';
import Approval from '@/lib/models/Approval';
import Notification from '@/lib/models/Notification';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string; aid: string }> }
) {
    try {
        const { token, aid: approvalId } = await params;
        const project = await validatePortalToken(token);
        if (!project) return NextResponse.json({ message: 'Invalid' }, { status: 404 });

        const body = await req.json();
        const { status, comment } = body;

        await connectDB();
        const approval = await Approval.findOne({ _id: approvalId, projectId: project._id });
        if (!approval) return NextResponse.json({ message: 'Approval not found' }, { status: 404 });

        approval.status = status;
        if (comment) {
            approval.comments.push({
                author: 'client',
                text: comment,
                createdAt: new Date()
            } as any);
        }
        await approval.save();

        // Already have notification logic in the standard respond route?
        // No, standard respond route was for freelancer to respond (wait, usually clients respond to approvals).
        // Ensure freelancer gets notified.
        await Notification.create({
            freelancerId: project.freelancerId,
            type: 'APPROVAL_RESPONSE',
            projectId: project._id,
            metadata: {
                approvalId: approval._id,
                status,
                title: approval.title
            }
        });

        const sanitized = approval.toObject();
        delete (sanitized as any).__v;

        return NextResponse.json(sanitized);
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
