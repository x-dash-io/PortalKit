import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import File from '@/lib/models/File';
import { getPresignedDownloadUrl } from '@/lib/r2';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
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

        const file = await File.findOne({ _id: fileId, projectId: projectId, status: 'active' });
        if (!file) return NextResponse.json({ message: 'File not found' }, { status: 404 });

        const downloadUrl = await getPresignedDownloadUrl(file.r2Key);

        return NextResponse.json({ downloadUrl });
    } catch (error) {
        console.error('Download error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
