import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import * as z from 'zod';
import { serializeMilestone } from '@/lib/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { milestoneSchema } from '@/lib/validation';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: projectId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const validated = milestoneSchema.parse(body);

        await connectDB();
        const project = await Project.findOne({ _id: projectId, freelancerId: session.user.id });

        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        project.milestones.push({
            title: validated.title,
            dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
            status: validated.status,
            order: project.milestones.length,
        });
        await project.save();

        const milestone = project.milestones[project.milestones.length - 1];
        return NextResponse.json(serializeMilestone(milestone), { status: 201 });
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
