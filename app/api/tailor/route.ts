import { NextResponse } from 'next/server'
import { tailorApplication } from '@/lib/tailorLogic'
import { getServerSupabase } from '@/lib/supabaseClient'
import { tailorSchema } from '@/lib/validation'
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
        const { success: withinRateLimit, retryAfter } = await rateLimit(user.id, 'ai')
        if (!withinRateLimit) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(retryAfter || 60) } }
            )
        }

        // 3. Plan Usage Check (Business Logic)
        const { allowed, limit, plan } = await checkUsage(supabase, user.id, 'tailor')
        if (!allowed) {
            return NextResponse.json(
                { error: `You have reached your daily limit of ${limit} tailored applications on the ${plan.toUpperCase()} plan. Upgrade to PRO for unlimited access.` },
                { status: 403 }
            )
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'System configuration error: Missing Gemini API Key' }, { status: 500 })
        }

        const body = await req.json()
        const parsed = tailorSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
        }
        const { profileId, jobId } = parsed.data

        // 2. IDOR Prevention: Ensure the profile being accessed belongs to the user
        if (profileId !== user.id) {
            return NextResponse.json({ error: 'Forbidden: You do not have permission to access this profile' }, { status: 403 })
        }

        // 3. Fetch Profile and Job from DB
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profileId)
            .maybeSingle()

        if (profileError) throw profileError
        if (!profile) {
            return NextResponse.json({ error: 'Profile not found or access denied (Check RLS)' }, { status: 404 })
        }

        const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .maybeSingle()

        if (jobError) throw jobError
        if (!job) {
            return NextResponse.json({ error: 'Job not found or access denied (Check RLS)' }, { status: 404 })
        }

        // 2. Run Tailoring Logic
        const { cv, coverLetter } = await tailorApplication({
            profile: {
                fullName: profile.full_name,
                email: profile.email || '',
                phone: profile.phone || '',
                address: profile.address || '',
                linkedinUrl: profile.linkedin_url || '',
                portfolioUrl: profile.portfolio_url || '',
                education: profile.educational_background || [],
                experience: profile.work_experience || [],
                skills: profile.skills || [],
                certifications: profile.certifications || [],
                languages: profile.languages || []
            },
            jobDescription: job.description
        })

        // 3. Save to Tailored Documents Table
        const { data, error } = await supabase
            .from('tailored_documents')
            .insert({
                user_id: profileId,
                job_id: jobId,
                title: `Tailored for ${job.title} at ${job.company}`,
                cv_content: cv,
                cover_letter_content: coverLetter,
                status: 'draft'
            })
            .select()
            .maybeSingle()

        if (error) {
            console.error('DB Insert Error:', error)
            throw error
        }

        if (!data) {
            return NextResponse.json({ error: 'Document saved but not visible (Check RLS policies)' }, { status: 500 })
        }

        // Log usage
        await incrementUsage(profileId, 'tailor')

        // Insert notification for the user
        await supabase.from('notifications').insert({
            user_id: profileId,
            title: 'Success: Document Tailored',
            message: `Mission-ready draft generated for ${job.title} at ${job.company}. Ready for launch.`,
            type: 'system',
            priority: 'high'
        })

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Critical Tailoring API Error:', error)
        return NextResponse.json({ error: 'Internal server error: Document generation failed' }, { status: 500 })
    }
}
