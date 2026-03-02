import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';

export async function PATCH(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { emailPreferences } = body;

        await connectDB();

        const user = await User.findByIdAndUpdate(
            (session.user as any).id,
            { $set: { emailPreferences } },
            { new: true }
        ).select('-password -__v').lean();

        return NextResponse.json(user);
    } catch (error) {
        console.error('Settings update error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
