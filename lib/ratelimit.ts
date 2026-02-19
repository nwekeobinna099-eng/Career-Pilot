import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Upstash Redis rate limiter using sliding window algorithm.
 * Gracefully degrades if Redis is unavailable (allows requests through).
 *
 * Env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN
 */

const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

/** Route-specific rate limiters */
const limiters = {
    // Scraping: 5 requests per 10 minutes (expensive — launches Playwright)
    scrape: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '10 m'),
        prefix: 'rl:scrape',
    }),

    // AI routes (tailor, interview-prep): 10 requests per minute
    ai: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        prefix: 'rl:ai',
    }),

    // CV parsing: 20 requests per minute
    parse: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '1 m'),
        prefix: 'rl:parse',
    }),
}

/**
 * Check if a request is within rate limits.
 *
 * @param userId - The authenticated user's ID
 * @param route  - Route key: 'scrape', 'ai', or 'parse'
 * @returns { success, remaining, retryAfter }
 */
export async function rateLimit(
    userId: string,
    route: keyof typeof limiters
): Promise<{ success: boolean; remaining: number; retryAfter?: number }> {
    try {
        const limiter = limiters[route]
        if (!limiter) return { success: true, remaining: 999 }

        const { success, remaining, reset } = await limiter.limit(userId)

        if (!success) {
            const retryAfter = Math.max(1, Math.ceil((reset - Date.now()) / 1000))
            return { success: false, remaining: 0, retryAfter }
        }

        return { success: true, remaining }
    } catch (error) {
        // If Redis is down, allow the request (graceful degradation)
        console.warn('[RateLimit] Redis error, allowing request:', (error as Error).message)
        return { success: true, remaining: 999 }
    }
}
