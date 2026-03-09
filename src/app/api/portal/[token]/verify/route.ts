import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import connectDB from '@/lib/mongodb';
import { validatePortalToken, createPortalSession } from '@/lib/portalAuth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    try {
        const { token } = await params;
        const { email } = await req.json();

        const project = await validatePortalToken(token);
        if (!project) return NextResponse.json({ message: 'Invalid token' }, { status: 404 });

        if (email.toLowerCase() !== project.clientEmail.toLowerCase()) {
            return NextResponse.json({ message: 'Access denied: Email does not match client record.' }, { status: 403 });
        }

        const sessionToken = await createPortalSession(email, project._id.toString());

        const cookieStore = await cookies();
        cookieStore.set(`portal_session_${project._id}`, sessionToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24, // 24 hours
            path: '/',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ message: 'Error' }, { status: 500 });
    }
}
