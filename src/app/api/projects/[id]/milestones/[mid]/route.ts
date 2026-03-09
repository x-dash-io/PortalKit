import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { milestoneSchema } from '@/lib/validation';
import { serializeMilestone } from '@/lib/serializers';
import * as z from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string; mid: string }> }
) {
    try {
        const { id: projectId, mid: milestoneId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const validated = milestoneSchema.partial().parse(body);

        await connectDB();

        const updateDoc: Record<string, unknown> = {};
        if (validated.title) updateDoc['milestones.$.title'] = validated.title;
        if (validated.status) updateDoc['milestones.$.status'] = validated.status;
        if (validated.dueDate) updateDoc['milestones.$.dueDate'] = new Date(validated.dueDate);
        if (validated.order !== undefined) updateDoc['milestones.$.order'] = validated.order;

        const project = await Project.findOneAndUpdate(
            {
                _id: projectId,
                freelancerId: session.user.id,
                'milestones._id': milestoneId
            },
            { $set: updateDoc },
            { new: true }
        ).select('milestones').lean();

        if (!project) return NextResponse.json({ message: 'Milestone not found' }, { status: 404 });

        const milestone = project.milestones.find((milestone) => milestone._id?.toString() === milestoneId);
        if (!milestone) return NextResponse.json({ message: 'Milestone not found' }, { status: 404 });

        return NextResponse.json(serializeMilestone(milestone));
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0]?.message ?? 'Invalid milestone update' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; mid: string }> }
) {
    try {
        const { id: projectId, mid: milestoneId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const project = await Project.findOneAndUpdate(
            { _id: projectId, freelancerId: session.user.id },
            { $pull: { milestones: { _id: milestoneId } } },
            { new: true }
        );

        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        return NextResponse.json({ message: 'Milestone deleted' });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
