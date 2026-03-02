import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Approval from '@/lib/models/Approval';
import Invoice from '@/lib/models/Invoice';
import File from '@/lib/models/File';
import { validatePortalToken } from '@/lib/portalAuth';

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

        // Fetch all data for the portal in parallel
        const [approvals, invoices, files] = await Promise.all([
            Approval.find({ projectId: project._id })
                .select('-__v')
                .sort({ createdAt: -1 })
                .populate('fileId', 'name type size url')
                .lean(),
            Invoice.find({ projectId: project._id, status: { $ne: 'draft' } })
                .select('-__v')
                .sort({ issueDate: -1 })
                .lean(),
            File.find({ projectId: project._id, status: 'active' })
                .select('-__v')
                .sort({ createdAt: -1 })
                .lean(),
        ]);

        return NextResponse.json({
            project: {
                _id: project._id,
                title: project.title,
                description: project.description,
                clientName: project.clientName,
                clientEmail: project.clientEmail,
                requireEmailVerification: project.requireEmailVerification,
                milestones: project.milestones,
            },
            approvals,
            invoices,
            files
        });
    } catch (error) {
        console.error('Portal API Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
