import { NextResponse } from 'next/server'
import getGeminiClient from '@/lib/gemini'
import * as mammoth from 'mammoth'
import { getServerSupabase } from '@/lib/supabaseClient'
import { parseCvSchema } from '@/lib/validation'
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
        const { success: withinLimit, retryAfter } = await rateLimit(user.id, 'parse')
        if (!withinLimit) {
            return NextResponse.json(
                { error: 'Too many requests. Please try again later.' },
                { status: 429, headers: { 'Retry-After': String(retryAfter || 60) } }
            )
        }

        const body = await req.json()
        const parsed = parseCvSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json({ error: parsed.error.issues[0]?.message || 'Invalid input' }, { status: 400 })
        }
        const { publicUrl } = parsed.data

        // 2. SSRF Protection: Validate URL
        try {
            const url = new URL(publicUrl)
            if (url.protocol !== 'https:') {
                return NextResponse.json({ error: 'Insecure URL protocol. HTTPS required.' }, { status: 400 })
            }

            // Restrict to Supabase storage domains for this project
            const allowedHost = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).host
            if (url.host !== allowedHost) {
                return NextResponse.json({ error: 'Forbidden: URL must be from the verified storage domain.' }, { status: 403 })
            }
        } catch (e) {
            return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
        }

        // 3. Fetch the file safely
        const fileResponse = await fetch(publicUrl)
        const arrayBuffer = await fileResponse.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        // 2. Initialize Gemini
        const genAI = getGeminiClient()
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.5-flash',
            generationConfig: {
                responseMimeType: 'application/json'
            }
        })

        const prompt = `
            You are a professional recruiting assistant. 
            Extract structured data from this CV and return it as a JSON object.
            
            STRUCTURE:
            {
                "full_name": "string",
                "email": "string",
                "phone": "string",
                "address": "string",
                "linkedin_url": "string",
                "portfolio_url": "string",
                "age": number | null,
                "educational_background": [
                    { "institution": "string", "degree": "string", "year": "string" }
                ],
                "work_experience": [
                    { "company": "string", "role": "string", "duration": "string", "description": "string" }
                ],
                "skills": ["string"],
                "certifications": ["string"],
                "languages": ["string"]
            }

            IMPORTANT:
            - Summarize the description for each work experience into high-impact bullet points.
            - Ensure the dates/durations are preserved.
            - If details are missing, use empty strings or arrays.
        `

        let result
        const isDocx = publicUrl.toLowerCase().endsWith('.docx')

        if (isDocx) {
            // Extract text from DOCX using mammoth
            const { value: text } = await mammoth.extractRawText({ buffer })
            result = await model.generateContent([
                { text: `CV CONTENT:\n${text}` },
                { text: prompt }
            ])
        } else {
            // Native PDF support
            const base64Data = buffer.toString('base64')
            result = await model.generateContent([
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: 'application/pdf'
                    }
                },
                { text: prompt }
            ])
        }

        const response = result.response.text()
        const parsedData = JSON.parse(response)

        return NextResponse.json(parsedData)
    } catch (error) {
        console.error('CV Parsing Error:', error)
        return NextResponse.json({ error: 'An unexpected error occurred while parsing your CV' }, { status: 500 })
    }
}
