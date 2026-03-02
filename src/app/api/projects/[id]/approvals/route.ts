import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Approval from '@/lib/models/Approval';
import Project from '@/lib/models/Project';
import { sendEmail } from '@/lib/email';
import { ApprovalRequestEmail } from '@/emails/approval-request';
import * as z from 'zod';

import { approvalSchema } from '@/lib/validation';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: projectId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const approvals = await Approval.find({ projectId })
            .select('-__v')
            .sort({ createdAt: -1 })
            .populate('fileId')
            .lean();

        return NextResponse.json(approvals);
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: projectId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const validated = approvalSchema.parse(body);

        await connectDB();
        const project = await Project.findOne({ _id: projectId, freelancerId: session.user.id });
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        const approval = (await Approval.create({
            ...validated,
            projectId,
            freelancerId: session.user.id,
            status: 'pending',
            comments: []
        })).toObject() as any;

        delete approval.__v;

        // Send Email to Client
        try {
            await sendEmail(
                project.clientEmail,
                `Review Needed: ${approval.title}`,
                ApprovalRequestEmail,
                {
                    approvalTitle: approval.title,
                    projectTitle: project.title,
                    description: approval.description || 'No description provided',
                    type: approval.type,
                    portalUrl: `${process.env.NEXTAUTH_URL}/portal/${project.portalTokenPrefix}`
                }
            );
        } catch (e) {
            console.error('Email error:', e);
        }

        return NextResponse.json(approval, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
