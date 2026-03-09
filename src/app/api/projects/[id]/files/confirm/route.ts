import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import File from '@/lib/models/File';
import User from '@/lib/models/User';
import { serializeFileRecord } from '@/lib/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { fileId } = await req.json();
        if (!fileId) return NextResponse.json({ message: 'Missing fileId' }, { status: 400 });

        await connectDB();

        // Verify project ownership
        const project = await Project.findOne({ _id: projectId, freelancerId: session.user.id });
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        const file = await File.findOneAndUpdate(
            { _id: fileId, projectId: projectId, status: 'pending' },
            { $set: { status: 'active' } },
            { new: true }
        );

        if (!file) return NextResponse.json({ message: 'File not found or already active' }, { status: 404 });

        // Atomically increment storage used
        await User.findByIdAndUpdate(session.user.id, {
            $inc: { storageUsed: file.size }
        });

        return NextResponse.json({ success: true, file: serializeFileRecord(file.toObject()) });
    } catch (error) {
        console.error('Confirm error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
