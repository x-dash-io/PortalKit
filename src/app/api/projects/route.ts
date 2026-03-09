import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import { getProjectCounts } from '@/lib/projectCounts';
import { serializeProjectDetail, serializeProjectSummary } from '@/lib/serializers';
import * as z from 'zod';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { projectSchema } from '@/lib/validation';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        await connectDB();
        const projects = await Project.find({ freelancerId: session.user.id, status: { $ne: 'archived' } })
            .select('-portalTokenHash -__v')
            .sort({ updatedAt: -1 })
            .lean();

        const counts = await getProjectCounts(projects.map((project) => String(project._id)));

        return NextResponse.json(
            projects.map((project) =>
                serializeProjectSummary(project, {
                    approvals: counts.approvals[String(project._id)] ?? 0,
                    files: counts.files[String(project._id)] ?? 0,
                    invoices: counts.invoices[String(project._id)] ?? 0,
                })
            )
        );
    } catch (error) {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const validated = projectSchema.parse(body);

        await connectDB();

        // Create portal token
        const token = uuidv4();
        const tokenHash = await bcrypt.hash(token, 10);
        const tokenPrefix = token.substring(0, 8);

        const project = (await Project.create({
            ...validated,
            freelancerId: session.user.id,
            portalTokenHash: tokenHash,
            portalTokenPrefix: tokenPrefix,
            status: 'active',
        })).toObject();

        return NextResponse.json({ project: serializeProjectDetail(project), token }, { status: 201 });
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
