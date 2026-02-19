import { NextResponse } from 'next/server'
import { getServerSupabase } from '@/lib/supabaseClient'
import { generateInterviewPrep } from '@/lib/interviewLogic'
import { interviewPrepSchema } from '@/lib/validation'
import { rateLimit } from '@/lib/ratelimit'

export async function POST(req: Request) {
    const supabase = getServerSupabase(req)
    try {
        // 1. Verify Authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized: Authentication required' }, { status: 401 })
        }

        // 2. Rate Limiting
        const { success: withinLimit, retryAfter } = await rateLimit(user.id, 'ai')
        if (!withinLimit) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(retryAfter || 60) } }
            )
        }

        const body = await req.json()
        const parsed = interviewPrepSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
        }
        const { jobId, documentId, profileId } = parsed.data

        // 2. IDOR Prevention: Ensure profileId matches user.id
        if (profileId !== user.id) {
            return NextResponse.json({ error: 'Forbidden: You do not have permission to access this profile' }, { status: 403 })
        }

        // 1. Fetch Job and Profile Data
        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single()

        if (jobError || !job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 })
        }

        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profileId)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // 2. Generate Prep Kit using AI
        const prepKitContent = await generateInterviewPrep({
            profile: {
                fullName: profile.full_name,
                education: profile.educational_background || [],
                experience: profile.work_experience || [],
                skills: profile.skills || [],
                certifications: profile.certifications || [],
                languages: profile.languages || []
            },
            job: {
                title: job.title,
                company: job.company,
                description: job.description
            }
        })

        // 3. Save to Database
        const { data, error: insertError } = await supabase
            .from('interview_prep_kits')
            .insert({
                user_id: profileId,
                job_id: jobId,
                document_id: documentId,
                content: prepKitContent
            })
            .select()
            .single()

        if (insertError) {
            console.error('Database insertion error:', insertError)
            return NextResponse.json({ error: 'Failed to save prep kit' }, { status: 500 })
        }

        // 4. Create Notification
        await supabase.from('notifications').insert({
            user_id: profileId,
            title: 'Interview Prep Ready',
            message: `Strategic prep kit generated for ${job.title} at ${job.company}. Time to prep for success.`,
            type: 'system',
            priority: 'high'
        })

        return NextResponse.json(data)
    } catch (error) {
        console.error('Interview Prep API Error:', error)
        return NextResponse.json({ error: 'An unexpected error occurred while generating interview prep' }, { status: 500 })
    }
}
