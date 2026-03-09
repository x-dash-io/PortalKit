import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Notification from '@/lib/models/Notification';
import { serializeNotificationRecord } from '@/lib/serializers';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();

        // Get last 10 notifications for the freelancer
        const notifications = await Notification.find({
            freelancerId: session.user.id,
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('projectId', 'title')
            .lean();

        return NextResponse.json(notifications.map((notification) => serializeNotificationRecord(notification)));
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        await connectDB();

        if (body.readAll) {
            await Notification.updateMany(
                { freelancerId: session.user.id, read: false },
                { $set: { read: true } }
            );
        }

        return NextResponse.json({ message: 'Notifications updated' });
    } catch (error) {
        console.error('Error updating notifications:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
