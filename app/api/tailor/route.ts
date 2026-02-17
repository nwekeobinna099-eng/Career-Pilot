import { NextResponse } from 'next/server'
import { tailorApplication } from '@/lib/tailorLogic'
import { supabase } from '@/lib/supabaseClient'

export async function POST(req: Request) {
    try {
        const { profileId, jobId } = await req.json()

        // 1. Fetch Profile and Job from DB
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', profileId)
            .single()

        const { data: job } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', jobId)
            .single()

        if (!profile || !job) {
            return NextResponse.json({ error: 'Profile or Job not found' }, { status: 404 })
        }

        // 2. Run Tailoring Logic
        const { cv, coverLetter } = await tailorApplication({
            profile: {
                fullName: profile.full_name,
                education: profile.educational_background,
                experience: profile.work_experience,
                skills: profile.skills || [],
                certifications: [] // Certs were in the UI but might need schema update or are part of profile
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
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error: any) {
        console.error('Tailoring error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
