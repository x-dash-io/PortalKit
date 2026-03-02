import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Use a shared Redis instance across the middleware
const redis = process.env.UPSTASH_REDIS_REST_URL
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
    : null;

// Different limiters for different routes
const authLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "60 s"),
    analytics: true,
    prefix: "ratelimit:auth",
}) : null;

const portalLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    analytics: true,
    prefix: "ratelimit:portal",
}) : null;

const uploadLimit = redis ? new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60 s"),
    analytics: true,
    prefix: "ratelimit:upload",
}) : null;

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Get IP from headers for Vercel/proxies
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
        request.headers.get('x-real-ip') ||
        '127.0.0.1';

    // 1. Apply Rate Limiting
    if (redis) {
        if (pathname.startsWith('/api/auth')) {
            const { success, limit, reset, remaining } = await authLimit!.limit(ip);
            if (!success) {
                return new NextResponse("Too Many Requests", {
                    status: 429,
                    headers: {
                        "X-RateLimit-Limit": limit.toString(),
                        "X-RateLimit-Remaining": remaining.toString(),
                        "X-RateLimit-Reset": reset.toString(),
                        "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
                    },
                });
            }
        }

        if (pathname.includes('/portal') && pathname.endsWith('/respond')) {
            const { success, limit, reset, remaining } = await portalLimit!.limit(ip);
            if (!success) {
                return new NextResponse("Too Many Requests", {
                    status: 429,
                    headers: {
                        "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
                    },
                });
            }
        }

        if (pathname.startsWith('/api/uploads/presign')) {
            const { success, limit, reset, remaining } = await uploadLimit!.limit(ip);
            if (!success) {
                return new NextResponse("Too Many Requests", {
                    status: 429,
                    headers: {
                        "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
                    },
                });
            }
        }
    }

    // 2. Add Security Headers
    const response = NextResponse.next();

    const securityHeaders = {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-XSS-Protection': '1; mode=block',
        // CSP is complex, typically handled in next.config.js or via meta tags if dynamic
    };

    Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

export const config = {
    matcher: [
        '/api/auth/:path*',
        '/api/portal/:path*',
        '/api/uploads/:path*',
        '/portal/:path*'
    ],
};
