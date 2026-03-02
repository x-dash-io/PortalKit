import { NextResponse } from 'next/server';
import { validatePortalToken } from '@/lib/portalAuth';
import connectDB from '@/lib/mongodb';
import File from '@/lib/models/File';
import { getPresignedDownloadUrl } from '@/lib/r2';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string; fid: string }> }
) {
    try {
        const { token, fid: fileId } = await params;
        const project = await validatePortalToken(token);
        if (!project) return NextResponse.json({ message: 'Invalid' }, { status: 404 });

        await connectDB();
        const file = await File.findOne({ _id: fileId, projectId: project._id });
        if (!file) return NextResponse.json({ message: 'File not found' }, { status: 404 });

        const downloadUrl = await getPresignedDownloadUrl(file.key);
        return NextResponse.json({ downloadUrl });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
