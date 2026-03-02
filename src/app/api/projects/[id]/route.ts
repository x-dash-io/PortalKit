import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import * as z from 'zod';

import { projectSchema } from '@/lib/validation';

const updateSchema = projectSchema.partial();

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const project = await Project.findOne({ _id: id, freelancerId: session.user.id })
            .select('-portalTokenHash -__v')
            .lean();

        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        return NextResponse.json(project);
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const validated = updateSchema.parse(body);

        await connectDB();
        const project = await Project.findOneAndUpdate(
            { _id: id, freelancerId: session.user.id },
            { $set: validated },
            { new: true }
        ).select('-portalTokenHash -__v').lean();

        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        return NextResponse.json(project);
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const project = await Project.findOneAndUpdate(
            { _id: id, freelancerId: session.user.id },
            { $set: { status: 'archived' } },
            { new: true }
        );

        if (!project) return NextResponse.json({ message: 'Project not found' }, { status: 404 });

        return NextResponse.json({ message: 'Project archived' });
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
