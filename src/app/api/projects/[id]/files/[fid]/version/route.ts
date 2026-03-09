import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import File from '@/lib/models/File';
import { getPresignedUploadUrl, generateFileKey } from '@/lib/r2';
import { serializeFileRecord } from '@/lib/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; fid: string }> }
) {
    try {
        const { id: projectId, fid: fileId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { filename, mimeType, size } = body as { filename?: string; mimeType?: string; size?: number };
        if (!filename || !mimeType || !size) {
            return NextResponse.json({ message: 'filename, mimeType, and size are required' }, { status: 400 });
        }

        await connectDB();

        // Verify project ownership
        const project = await Project.findOne({ _id: projectId, freelancerId: session.user.id });
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        const existingFile = await File.findOne({ _id: fileId, projectId: projectId });
        if (!existingFile) return NextResponse.json({ message: 'Original file not found' }, { status: 404 });

        const newFileKey = generateFileKey(projectId, filename);
        const uploadUrl = await getPresignedUploadUrl(newFileKey, mimeType);

        existingFile.versions.push({
            r2Key: existingFile.r2Key,
            uploadedAt: new Date(),
            size: existingFile.size,
        });
        existingFile.r2Key = newFileKey;
        existingFile.status = 'pending';
        existingFile.size = size;
        existingFile.name = filename;
        existingFile.originalName = filename;
        existingFile.mimeType = mimeType;
        await existingFile.save();

        return NextResponse.json({
            uploadUrl,
            fileKey: newFileKey,
            file: serializeFileRecord(existingFile.toObject()),
        });
    } catch (error) {
        console.error('Version error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
