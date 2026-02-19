import getGeminiClient from './gemini'
import { sanitizeForPrompt, sanitizeObjectForPrompt } from './validation'

export interface InterviewInput {
    profile: {
        fullName: string
        education: any[]
        experience: any[]
        skills: string[]
        certifications: string[]
        languages: string[]
    }
    job: {
        title: string
        company: string
        description: string
    }
}

export async function generateInterviewPrep(input: InterviewInput) {
    // C5: Sanitize user-controlled data before prompt interpolation
    const profile = sanitizeObjectForPrompt(input.profile) as InterviewInput['profile']
    const job = sanitizeObjectForPrompt(input.job) as InterviewInput['job']

    const genAI = getGeminiClient()
    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 8192,
            temperature: 0.7
        }
    })

    const context = `
    ### JOB CONTEXT
    **Role:** ${job.title} at ${job.company}
    **Job Description:**
    ${job.description}

    ### CANDIDATE PROFILE
    **Name:** ${profile.fullName}
    **Experience:** ${JSON.stringify(profile.experience)}
    **Education:** ${JSON.stringify(profile.education)}
    **Skills:** ${profile.skills.join(', ')}
    `

    const prompt = `
    You are an elite executive interview coach and expert hiring manager.
    ${context}

    ### YOUR MISSION
    Generate a comprehensive, high-fidelity interview preparation suite for this specific candidate and role.

    ### STRUCTURE REQUIRED
    Return a JSON object with these sections:

    1. **intro**: A 2-sentence strategic briefing on why the candidate is a fit.
    
    2. **behavioralQuestions**: 5 tailored questions. For each, provide:
       - "question": text
       - "strategy": brief coach's advice
       - "starAnswer": A HIGH-IMPACT, concise answer using candidate's experience.

    3. **technicalDrills**: 5 technical or role-specific drills.
       - "question": challenge
       - "answer": ideal professional response.

    4. **companyIntelligence**: 3 strategic insights.

    5. **questionsForInterviewer**: 3 sophisticated questions.

    ### RULES
    - **Ultra-Personalization**: Use candidate's SPECIFIC achievements.
    - **Be Concise**: Keep answers punchy and professional. Longer is NOT better.
    - **JSON ONLY**: NO text before or after the JSON.
    - **NO INTERNAL NEWLINES**: Ensure strings do not contain literal unescaped newlines. Use \\n if needed.

    ### OUTPUT FORMAT
    Return ONLY a raw JSON object:
    {
      "intro": "...",
      "behavioralQuestions": [ { "question": "...", "strategy": "...", "starAnswer": "..." } ],
      "technicalDrills": [ { "question": "...", "answer": "..." } ],
      "companyIntelligence": [ { "title": "...", "insight": "..." } ],
      "questionsForInterviewer": [ { "question": "...", "context": "..." } ]
    }
    `

    let attempts = 0
    const maxAttempts = 3
    const baseDelay = 16000 // Start with 16s because the error suggests ~15s delay

    while (attempts < maxAttempts) {
        try {
            const result = await model.generateContent(prompt)
            const text = result.response.text()

            // Robust JSON extraction
            let jsonString = text.trim()

            // 1. Remove markdown code blocks if present
            if (jsonString.startsWith('```')) {
                jsonString = jsonString.replace(/^```json\n?|```$/g, '').trim()
            }

            // 2. Exact match for the outermost JSON object if still messy
            const match = jsonString.match(/\{[\s\S]*\}/)
            if (match) {
                jsonString = match[0]
            }

            const parseJsonResiliently = (str: string) => {
                try {
                    return JSON.parse(str)
                } catch (e) {
                    // Try to fix common AI JSON issues
                    let fixed = str
                        .replace(/,\s*([\]}])/g, '$1') // Trailing commas
                        .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Control chars
                        .replace(/\n/g, '\\n') // Literal newlines (risky but sometimes necessary)
                        // Re-fix brackets because the global \n replace might have broken things
                        .replace(/\\n\s*([{}[\],])/g, '\n$1')

                    try {
                        return JSON.parse(fixed)
                    } catch (innerE) {
                        console.error('Final JSON Parse Failure. Raw Content:', str)
                        throw innerE
                    }
                }
            }

            return parseJsonResiliently(jsonString)
        } catch (e: any) {
            attempts++
            const isQuotaError = e.message?.includes('429') || e.message?.includes('quota')

            if (isQuotaError && attempts < maxAttempts) {
                const delay = baseDelay * Math.pow(2, attempts - 1)
                console.warn(`Gemini Quota Exceeded. Retrying in ${delay}ms (Attempt ${attempts}/${maxAttempts})...`)
                await new Promise(resolve => setTimeout(resolve, delay))
                continue
            }

            console.error('Interview Prep Generation Error:', e)
            throw new Error(`Failed to generate valid interview kit: ${e instanceof Error ? e.message : 'Unknown Error'}`)
        }
    }
}
