import { NextResponse } from 'next/server';
import { validatePortalToken } from '@/lib/portalAuth';
import connectDB from '@/lib/mongodb';
import Approval from '@/lib/models/Approval';
import Notification from '@/lib/models/Notification';
import { approvalResponseSchema } from '@/lib/validation';
import { serializeApprovalRecord } from '@/lib/serializers';
import * as z from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string; aid: string }> }
) {
    try {
        const { token, aid: approvalId } = await params;
        const project = await validatePortalToken(token);
        if (!project) return NextResponse.json({ message: 'Invalid' }, { status: 404 });

        const body = await req.json();
        const { status, comment } = approvalResponseSchema.parse(body);

        await connectDB();
        const approval = await Approval.findOne({ _id: approvalId, projectId: project._id }).populate(
            'fileId',
            'name originalName mimeType size'
        );
        if (!approval) return NextResponse.json({ message: 'Approval not found' }, { status: 404 });

        approval.status = status;
        if (comment) {
            approval.comments.push({
                author: 'client',
                text: comment,
                createdAt: new Date()
            });
        }
        await approval.save();

        // Already have notification logic in the standard respond route?
        // No, standard respond route was for freelancer to respond (wait, usually clients respond to approvals).
        // Ensure freelancer gets notified.
        await Notification.create({
            freelancerId: project.freelancerId,
            type: 'APPROVAL_RESPONDED',
            projectId: project._id,
            metadata: {
                approvalId: approval._id,
                status,
                title: approval.title
            }
        });

        return NextResponse.json(serializeApprovalRecord(approval.toObject()));
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0]?.message ?? 'Invalid response' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
