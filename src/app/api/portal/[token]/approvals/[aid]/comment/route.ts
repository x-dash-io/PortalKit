import { NextResponse } from 'next/server';
import { validatePortalToken } from '@/lib/portalAuth';
import connectDB from '@/lib/mongodb';
import Approval from '@/lib/models/Approval';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string; aid: string }> }
) {
    try {
        const { token, aid: approvalId } = await params;
        const project = await validatePortalToken(token);
        if (!project) return NextResponse.json({ message: 'Invalid' }, { status: 404 });

        const { text } = await req.json();
        if (!text) return NextResponse.json({ message: 'Text required' }, { status: 400 });

        await connectDB();
        const approval = await Approval.findOne({ _id: approvalId, projectId: project._id });
        if (!approval) return NextResponse.json({ message: 'Approval not found' }, { status: 404 });

        approval.comments.push({
            author: 'client',
            text,
            createdAt: new Date()
        } as any);
        await approval.save();

        return NextResponse.json(approval.comments[approval.comments.length - 1]);
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
