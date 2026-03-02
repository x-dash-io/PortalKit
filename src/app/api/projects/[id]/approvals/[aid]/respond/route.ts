import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Approval from '@/lib/models/Approval';
import Notification from '@/lib/models/Notification';
import Project from '@/lib/models/Project';
import { sendEmail } from '@/lib/email';
import { ApprovalRespondedEmail } from '@/emails/approval-responded';
import User from '@/lib/models/User';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; aid: string }> }
) {
    try {
        const { id: projectId, aid: approvalId } = await params;
        const body = await req.json();
        const { status, comment } = body;

        if (!['approved', 'changes_requested'].includes(status)) {
            return NextResponse.json({ message: 'Invalid status' }, { status: 400 });
        }

        await connectDB();
        const approval = await Approval.findById(approvalId);
        if (!approval) return NextResponse.json({ message: 'Approval not found' }, { status: 404 });

        const project = await Project.findById(projectId).lean();
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        approval.status = status;
        if (comment) {
            approval.comments.push({
                author: 'client',
                text: comment,
                createdAt: new Date(),
            } as any);
        }
        await approval.save();

        // Create Notification for Freelancer
        await Notification.create({
            freelancerId: approval.freelancerId,
            type: 'approval_response',
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

        const sanitized = approval.toObject();
        delete (sanitized as any).__v;

        return NextResponse.json(sanitized);
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
