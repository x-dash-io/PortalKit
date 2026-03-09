import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Approval from '@/lib/models/Approval';
import Notification from '@/lib/models/Notification';
import Project from '@/lib/models/Project';
import { sendEmail } from '@/lib/email';
import { ApprovalRespondedEmail } from '@/emails/approval-responded';
import User from '@/lib/models/User';
import { approvalResponseSchema } from '@/lib/validation';
import { serializeApprovalRecord } from '@/lib/serializers';
import * as z from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; aid: string }> }
) {
    try {
        const { id: projectId, aid: approvalId } = await params;
        const body = await req.json();
        const { status, comment } = approvalResponseSchema.parse(body);

        await connectDB();
        const approval = await Approval.findById(approvalId).populate('fileId', 'name originalName mimeType size');
        if (!approval) return NextResponse.json({ message: 'Approval not found' }, { status: 404 });

        const project = await Project.findById(projectId).lean();
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        approval.status = status;
        if (comment) {
            approval.comments.push({
                author: 'client',
                text: comment,
                createdAt: new Date(),
            });
        }
        await approval.save();

        // Create Notification for Freelancer
        await Notification.create({
            freelancerId: approval.freelancerId,
            type: 'APPROVAL_RESPONDED',
            projectId,
            metadata: {
                approvalId: approval._id,
                status: status,
                title: approval.title
            }
        });

        // Send Email to Freelancer
        try {
            const freelancer = await User.findById(approval.freelancerId);
            if (freelancer && freelancer.emailPreferences?.approvalResponded !== false) {
                await sendEmail(
                    freelancer.email,
                    `Client ${status.replace('_', ' ')}: ${approval.title}`,
                    ApprovalRespondedEmail,
                    {
                        approvalTitle: approval.title,
                        status: status,
                        comment: comment,
                        dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard/projects/${projectId}`
                    }
                );
            }
        } catch (e) {
            console.error('Email error:', e);
        }

        return NextResponse.json(serializeApprovalRecord(approval.toObject()));
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0]?.message ?? 'Invalid response' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
