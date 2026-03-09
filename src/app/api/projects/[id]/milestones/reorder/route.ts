import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { serializeMilestone } from '@/lib/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: projectId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { milestones } = await req.json();
        if (!Array.isArray(milestones)) {
            return NextResponse.json({ message: 'Invalid milestones data' }, { status: 400 });
        }

        await connectDB();
        const project = await Project.findOneAndUpdate(
            { _id: projectId, freelancerId: session.user.id },
            { $set: { milestones: milestones } },
            { new: true }
        ).select('milestones').lean();

        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        return NextResponse.json(
            project.milestones.map((milestone) => serializeMilestone(milestone as unknown as Record<string, unknown>))
        );
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
