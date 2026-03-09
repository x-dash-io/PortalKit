import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Approval from '@/lib/models/Approval';
import { commentSchema } from '@/lib/validation';
import { serializeApprovalComment } from '@/lib/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; aid: string }> }
) {
    try {
        const { aid: approvalId } = await params;
        const session = await getServerSession(authOptions);

        const body = await req.json();
        const { text } = commentSchema.parse(body);

        await connectDB();
        const approval = await Approval.findById(approvalId);
        if (!approval) return NextResponse.json({ message: 'Approval not found' }, { status: 404 });

        const comment: {
            author: 'freelancer' | 'client';
            text: string;
            createdAt: Date;
        } = {
            author: session ? 'freelancer' : 'client',
            text,
            createdAt: new Date(),
        };

        approval.comments.push(comment);
        await approval.save();

        return NextResponse.json(serializeApprovalComment(comment));
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
