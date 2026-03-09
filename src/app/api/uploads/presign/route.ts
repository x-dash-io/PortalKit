import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import File from '@/lib/models/File';
import User from '@/lib/models/User';
import { getPresignedUploadUrl, generateFileKey } from '@/lib/r2';
import * as z from 'zod';
import { serializeFileRecord } from '@/lib/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const presignSchema = z.object({
    projectId: z.string(),
    filename: z.string(),
    mimeType: z.string(),
    size: z.number().max(524288000, 'File size exceeds 500MB limit'),
    folder: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const { projectId, filename, mimeType, size, folder } = presignSchema.parse(body);

        await connectDB();

        // Verify project ownership
        const project = await Project.findOne({ _id: projectId, freelancerId: session.user.id }).lean();
        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        // Verify storage quota (5GB limit)
        const user = await User.findById(session.user.id).lean();
        const quota = 5 * 1024 * 1024 * 1024;
        if ((user?.storageUsed || 0) + size > quota) {
            return NextResponse.json({ message: 'Storage quota exceeded' }, { status: 403 });
        }

        const fileKey = generateFileKey(projectId, filename);
        const uploadUrl = await getPresignedUploadUrl(fileKey, mimeType);
        const fileDoc = await File.create({
            projectId,
            freelancerId: session.user.id,
            name: filename,
            originalName: filename,
            mimeType,
            size,
            r2Key: fileKey,
            r2Bucket: process.env.R2_BUCKET_NAME || 'default',
            folder: folder || 'Root',
            status: 'pending',
            versions: [],
        });

        return NextResponse.json({
            uploadUrl,
            fileKey,
            fileId: String(fileDoc._id),
            file: serializeFileRecord(fileDoc.toObject()),
        });
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
        }
        console.error('Presign error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
