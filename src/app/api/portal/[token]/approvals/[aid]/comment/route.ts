import { NextResponse } from 'next/server';
import { validatePortalToken } from '@/lib/portalAuth';
import connectDB from '@/lib/mongodb';
import Approval from '@/lib/models/Approval';
import { commentSchema } from '@/lib/validation';
import { serializeApprovalComment } from '@/lib/serializers';

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
        const { text } = commentSchema.parse(body);

        await connectDB();
        const approval = await Approval.findOne({ _id: approvalId, projectId: project._id });
        if (!approval) return NextResponse.json({ message: 'Approval not found' }, { status: 404 });

        approval.comments.push({
            author: 'client',
            text,
            createdAt: new Date()
        });
        await approval.save();

        return NextResponse.json(serializeApprovalComment(approval.comments[approval.comments.length - 1]));
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
