import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { DEFAULT_EMAIL_PREFERENCES, DEFAULT_THEME, type AppTheme, type EmailPreferences } from '@/lib/contracts';
import { settingsSchema } from '@/lib/validation';
import * as z from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        await connectDB();
        const user = await User.findById(session.user.id).select('-password -__v').lean();

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: String(user._id),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            logo: user.logo,
            accentColor: user.accentColor,
            theme: (user.theme as AppTheme | undefined) ?? DEFAULT_THEME,
            plan: user.plan,
            storageUsed: user.storageUsed,
            emailPreferences: (user.emailPreferences as EmailPreferences | undefined) ?? DEFAULT_EMAIL_PREFERENCES,
        });
    } catch (error) {
        console.error('Settings fetch error:', error);
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
        const payload = settingsSchema.parse(body);
        const updateDoc: Record<string, unknown> = {};

        if (payload.theme) {
            updateDoc.theme = payload.theme;
        }

        if (payload.profile) {
            for (const [key, value] of Object.entries(payload.profile)) {
                updateDoc[key] = value === '' ? undefined : value;
            }
        }

        if (payload.emailPreferences) {
            updateDoc.emailPreferences = {
                ...DEFAULT_EMAIL_PREFERENCES,
                ...payload.emailPreferences,
            };
        }

        await connectDB();

        const user = await User.findByIdAndUpdate(
            session.user.id,
            { $set: updateDoc },
            { new: true }
        ).select('-password -__v').lean();

        if (!user) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            id: String(user._id),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            logo: user.logo,
            accentColor: user.accentColor,
            theme: (user.theme as AppTheme | undefined) ?? DEFAULT_THEME,
            plan: user.plan,
            storageUsed: user.storageUsed,
            emailPreferences: (user.emailPreferences as EmailPreferences | undefined) ?? DEFAULT_EMAIL_PREFERENCES,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: error.issues[0]?.message ?? 'Invalid settings payload' }, { status: 400 });
        }
        console.error('Settings update error:', error);
        return NextResponse.json({ message: 'Server error' }, { status: 500 });
    }
}
