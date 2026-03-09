import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getPresignedUploadUrl } from '@/lib/r2';
import * as z from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  filename: z.string(),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  field: z.enum(['avatar', 'logo']),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { filename, mimeType, field } = schema.parse(body);

    const ext = filename.split('.').pop() ?? 'jpg';
    const key = `users/${session.user.id}/${field}-${Date.now()}.${ext}`;

    const uploadUrl = await getPresignedUploadUrl(key, mimeType);
    const publicUrl = `${process.env.R2_PUBLIC_URL ?? ''}/${key}`;

    return NextResponse.json({ uploadUrl, key, publicUrl });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
    }
    console.error('Avatar presign error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
