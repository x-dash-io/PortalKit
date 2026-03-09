import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Approval from '@/lib/models/Approval';
import Invoice from '@/lib/models/Invoice';
import File from '@/lib/models/File';
import User from '@/lib/models/User';
import { validatePortalToken } from '@/lib/portalAuth';
import { getProjectCounts } from '@/lib/projectCounts';
import { serializePortalPayload } from '@/lib/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const project = await validatePortalToken(token);

        if (!project) {
            return NextResponse.json({ message: 'Invalid or expired portal link' }, { status: 404 });
        }

        await connectDB();

        const [approvals, invoices, files, freelancer, counts] = await Promise.all([
            Approval.find({ projectId: project._id })
                .select('-__v')
                .sort({ createdAt: -1 })
                .populate('fileId', 'name originalName mimeType size')
                .lean(),
            Invoice.find({ projectId: project._id, status: { $ne: 'draft' } })
                .select('-__v')
                .sort({ issueDate: -1, createdAt: -1 })
                .lean(),
            File.find({ projectId: project._id, status: 'active' })
                .select('-__v')
                .sort({ createdAt: -1 })
                .lean(),
            User.findById(project.freelancerId).select('name theme logo avatar').lean(),
            getProjectCounts([String(project._id)]),
        ]);

        return NextResponse.json(
            serializePortalPayload({
                theme: freelancer?.theme,
                freelancerName: freelancer?.name,
                freelancerLogo: (freelancer as { logo?: string } | null)?.logo,
                project,
                approvals,
                invoices,
                files,
                counts: {
                    approvals: counts.approvals[String(project._id)] ?? 0,
                    files: counts.files[String(project._id)] ?? 0,
                    invoices: counts.invoices[String(project._id)] ?? 0,
                },
            })
        );
    } catch (error) {
        console.error('Portal API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
