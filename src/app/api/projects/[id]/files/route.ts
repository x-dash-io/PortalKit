import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import File from '@/lib/models/File';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: projectId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const folder = searchParams.get('folder');
        const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
        const cursor = searchParams.get('cursor');

        await connectDB();

        // Verify project ownership
        const project = await Project.findOne({ _id: projectId, freelancerId: session.user.id });
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        const query: any = { projectId, status: 'active' };
        if (folder && folder !== 'All Files') {
            query.folder = folder;
        }
        if (cursor) {
            query._id = { $lt: cursor }; // Cursor-based: fetch items created before this ID
        }

        const files = await File.find(query)
            .sort({ _id: -1 }) // Sort by ID desc for consistent cursor
            .limit(limit)
            .select('-__v')
            .lean();

        const nextCursor = files.length === limit ? files[files.length - 1]._id : null;

        return NextResponse.json({
            files,
            nextCursor
        });
    } catch (error) {
        console.error('List files error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
