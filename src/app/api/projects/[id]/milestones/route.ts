import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import * as z from 'zod';

import { milestoneSchema } from '@/lib/validation';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id: projectId } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const validated = milestoneSchema.parse(body);

        await connectDB();
        const project = await Project.findOneAndUpdate(
            { _id: projectId, freelancerId: session.user.id },
            {
                $push: {
                    milestones: {
                        ...validated,
                        dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
                        order: 0 // Will handle order better in bulk reorder
                    }
                }
            },
            { new: true }
        );

        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        const milestone = project.milestones[project.milestones.length - 1];
        return NextResponse.json(milestone, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
