import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import File from '@/lib/models/File';
import { getPresignedUploadUrl, generateFileKey } from '@/lib/r2';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string; fid: string }> }
) {
    try {
        const { id: projectId, fid: fileId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { filename, mimeType, size } = body;

        await connectDB();

        // Verify project ownership
        const project = await Project.findOne({ _id: projectId, freelancerId: session.user.id });
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        const existingFile = await File.findOne({ _id: fileId, projectId: projectId });
        if (!existingFile) return NextResponse.json({ message: 'Original file not found' }, { status: 404 });

        const newFileKey = generateFileKey(projectId, filename);
        const uploadUrl = await getPresignedUploadUrl(newFileKey, mimeType);

        // Move current r2Key to versions before it's updated (during confirm)
        // Here we just prepare the new version. The actual swap will happen upon confirm.
        // However, to keep it simple as requested: "Move current r2Key to versions array".

        await File.updateOne(
            { _id: fileId },
            {
                $push: {
                    versions: {
                        r2Key: existingFile.r2Key,
                        versionDate: new Date()
                    }
                }
            }
        );

        // We keep the File document, but we'll update r2Key and status to pending for the NEW version.
        // Note: To avoid losing the file if confirmation fails, better approach is a new File doc or more complex state.
        // For this lab, we'll follow the prompt literally: create new presigned URL.

        // We update the doc to reflect the NEW pending version
        await File.updateOne(
            { _id: fileId },
            {
                $set: {
                    r2Key: newFileKey,
                    status: 'pending',
                    size: size, // New size
                    name: filename,
                }
            }
        );

        return NextResponse.json({
            uploadUrl,
            fileKey: newFileKey,
        });
    } catch (error) {
        console.error('Version error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
