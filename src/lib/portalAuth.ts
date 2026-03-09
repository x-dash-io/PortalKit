import bcrypt from 'bcryptjs';
import connectDB from './mongodb';
import Project from './models/Project';
import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

import { cache } from 'react';

export const validatePortalToken = cache(async (token: string) => {
    if (!token || token.length < 8) return null;

    // The public portal URL uses just the portalTokenPrefix (first 8 chars of the UUID).
    // We do a prefix lookup — no bcrypt needed since the prefix is the public identifier.
    const prefix = token.slice(0, 8);
    await connectDB();

    const project = await Project.findOne({ portalTokenPrefix: prefix, portalEnabled: true }).lean();
    if (!project) return null;

    return project;
});

export async function createPortalSession(clientEmail: string, projectId: string) {
    const token = await new SignJWT({ clientEmail, projectId })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('24h')
        .sign(JWT_SECRET);
    return token;
}

export async function verifyPortalSession(token: string) {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        return payload as { clientEmail: string; projectId: string };
    } catch (e) {
        return null;
    }
}
