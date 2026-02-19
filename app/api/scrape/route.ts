import { NextResponse } from 'next/server'
import { scrapeJobs } from '@/lib/scraper'
import { getServerSupabase } from '@/lib/supabaseClient'
import { scrapeSchema } from '@/lib/validation'
import { rateLimit } from '@/lib/ratelimit'
import { checkUsage, incrementUsage } from '@/lib/plans'

export async function POST(req: Request) {
    const supabase = getServerSupabase(req)
    try {
        // 1. Verify Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 })
        }

        // 2. Rate Limiting (Anti-abuse)
        const { success: withinRateLimit, retryAfter } = await rateLimit(user.id, 'scrape')
        if (!withinRateLimit) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(retryAfter || 600) } }
            )
        }

        // 3. Plan Usage Check (Business Logic)
        const { allowed, limit, plan } = await checkUsage(supabase, user.id, 'scrape')
        if (!allowed) {
            return NextResponse.json(
                { error: `You have reached your daily limit of ${limit} scrapes on the ${plan.toUpperCase()} plan. Upgrade to PRO for unlimited access.` },
                { status: 403 }
            )
        }

        const body = await req.json()
        const parsed = scrapeSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
        }
        const { query, location, platform, dateFilter } = parsed.data

        const jobs = await scrapeJobs(query, location, platform, dateFilter)

        // Save jobs to Supabase
        if (jobs.length > 0) {
            const { error } = await supabase
                .from('jobs')
                .insert(jobs.map((j: any) => ({
                    title: j.title,
                    company: j.company,
                    location: j.location,
                    description: j.description,
                    platform: j.platform,
                    url: j.url
                })))

            if (error) {
                console.error('Supabase insert error:', error)
            } else {
                // Log usage
                await incrementUsage(user.id, 'scrape')

                // Insert notification for the user
                if (user) {
                    await supabase.from('notifications').insert({
                        user_id: user.id,
                        title: 'Scrape Successful',
                        message: `Mission accomplished. Found ${jobs.length} new roles for "${query}".`,
                        type: 'scrape',
                        priority: 'normal'
                    })
                }
            }
        }

        return NextResponse.json({ count: jobs.length, jobs })
    } catch (error: any) {
        console.error('Critical Scrape API Error:', error)
        return NextResponse.json({ error: 'Internal server error during scraping mission' }, { status: 500 })
    }
}
