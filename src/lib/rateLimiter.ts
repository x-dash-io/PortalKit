import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 10 requests per 10 seconds
export const rateLimiter = (limit: number, window: string = "60 s") => {
    if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
        return null;
    }

    const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });

    return new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(limit, window as `${number} ${'s' | 'm' | 'h' | 'd'}`),
        analytics: true,
    });
};
