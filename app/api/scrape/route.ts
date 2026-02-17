import { NextResponse } from 'next/server'
import { scrapeJobs } from '@/lib/scraper'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: Request) {
    try {
        const { query, location, platform } = await req.json()

        if (!query) {
            return NextResponse.json({ error: 'Query is required' }, { status: 400 })
        }

        const jobs = await scrapeJobs(query, location, platform)

        // Save jobs to Supabase
        if (jobs.length > 0) {
            const { error } = await supabase
                .from('jobs')
                .insert(jobs.map((j: any) => ({
                    title: j.title,
                    company: j.company,
                    description: j.description,
                    platform: j.platform,
                    url: j.url
                })))

            if (error) {
                console.error('Supabase insert error:', error)
            }
        }

        return NextResponse.json({ count: jobs.length, jobs })
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
