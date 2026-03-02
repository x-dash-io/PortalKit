import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Project from '@/lib/models/Project';
import Notification from '@/lib/models/Notification';
import User from '@/lib/models/User';
import { sendEmail } from '@/lib/email';
import { validatePortalToken } from '@/lib/portalAuth';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const project = await validatePortalToken(token);

        if (!project) return NextResponse.json({ message: 'Invalid' }, { status: 404 });

        await connectDB();

        // Debounce notifications: max 1 per 6 hours per project
        const lastNotification = await Notification.findOne({
            projectId: project._id,
            type: 'portal_view',
            createdAt: { $gt: new Date(Date.now() - 6 * 60 * 60 * 1000) }
        });

        if (!lastNotification) {
            await Notification.create({
                freelancerId: project.freelancerId,
                type: 'PORTAL_VISITED', // Standardize type string
                projectId: project._id,
                metadata: {
                    projectTitle: project.title
                }
            });

            // Send email if preferred
            const freelancer = await User.findById(project.freelancerId);
            if (freelancer && freelancer.emailPreferences?.portalVisited) {
                // No specific template defined for portal visit in Task Step 2.
                // Skipping email for now to avoid lint errors.
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
