import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import File from '@/lib/models/File';
import User from '@/lib/models/User';
import { deleteObject } from '@/lib/r2';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; fid: string }> }
) {
    try {
        const { id: projectId, fid: fileId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectDB();

        // Verify project ownership
        const project = await Project.findOne({ _id: projectId, freelancerId: session.user.id });
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        const file = await File.findOne({ _id: fileId, projectId: projectId });
        if (!file) return NextResponse.json({ message: 'File not found' }, { status: 404 });

        // Delete from R2
        await deleteObject(file.r2Key);

        // Delete from DB
        await File.deleteOne({ _id: fileId });

        // Decrement user storageUsed
        await User.findByIdAndUpdate(session.user.id, {
            $inc: { storageUsed: -file.size }
        });

        return NextResponse.json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
