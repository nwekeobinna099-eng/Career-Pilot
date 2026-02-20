import { z } from 'zod'

/**
 * Centralized input validation schemas for all API routes.
 * Prevents malformed input, injection attacks, and type errors.
 */

// Common UUID validation
const uuid = z.string().uuid('Invalid ID format')

// /api/scrape
export const scrapeSchema = z.object({
    query: z.string().min(1, 'Query is required').max(200, 'Query too long'),
    location: z.string().min(1, 'Location is required').max(100, 'Location too long'),
    platform: z.enum(['indeed', 'linkedin']).default('indeed'),
    dateFilter: z.enum(['all', '24h', '3d', '7d']).default('all'),
})

// /api/tailor
export const tailorSchema = z.object({
    profileId: uuid,
    jobId: uuid,
})

// /api/interview-prep
export const interviewPrepSchema = z.object({
    jobId: uuid,
    documentId: uuid,
    profileId: uuid,
})

// /api/parse-cv
export const parseCvSchema = z.object({
    publicUrl: z.string().url('Invalid URL format'),
})


/**
 * Sanitize a string for use in AI prompts.
 * Strips characters and patterns that could be used for prompt injection.
 */
export function sanitizeForPrompt(input: string, maxLength: number = 5000): string {
    return input
        .slice(0, maxLength)
        // Remove common prompt injection patterns
        .replace(/ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi, '[FILTERED]')
        .replace(/system\s*:\s*/gi, '')
        .replace(/\n{3,}/g, '\n\n') // Collapse excessive newlines
        .trim()
}

/**
 * Sanitize an object's string values for AI prompt interpolation.
 * Recursively processes nested objects and arrays.
 */
export function sanitizeObjectForPrompt(obj: Record<string, any>, maxFieldLength: number = 2000): Record<string, any> {
    const sanitized: Record<string, any> = {}
    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string') {
            sanitized[key] = sanitizeForPrompt(value, maxFieldLength)
        } else if (Array.isArray(value)) {
            sanitized[key] = value.map(item =>
                typeof item === 'string'
                    ? sanitizeForPrompt(item, maxFieldLength)
                    : typeof item === 'object' && item !== null
                        ? sanitizeObjectForPrompt(item, maxFieldLength)
                        : item
            )
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObjectForPrompt(value, maxFieldLength)
        } else {
            sanitized[key] = value
        }
    }
    return sanitized
}
