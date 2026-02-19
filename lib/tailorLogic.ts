import getGeminiClient from './gemini'
import { sanitizeForPrompt, sanitizeObjectForPrompt } from './validation'

export interface TailoringInput {
    profile: {
        fullName: string
        email: string
        phone: string
        address: string
        linkedinUrl: string
        portfolioUrl: string
        education: any[]
        experience: any[]
        skills: string[]
        certifications: string[]
        languages: string[]
    }
    jobDescription: string
}

export async function tailorApplication(input: TailoringInput) {
    // C5: Sanitize user-controlled data before prompt interpolation
    const profile = sanitizeObjectForPrompt(input.profile) as TailoringInput['profile']
    const jobDescription = sanitizeForPrompt(input.jobDescription, 10000)

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
    ### 1. CONTEXT
    **FULL JOB DESCRIPTION (HIGH FIDELITY):**
    ${jobDescription}

    **USER PROFILE:**
    - Name: ${profile.fullName}
    - Email: ${profile.email || 'OMIT'}
    - Phone: ${profile.phone || 'OMIT'}
    - Address: ${profile.address || 'OMIT'}
    - LinkedIn: ${profile.linkedinUrl || 'OMIT'}
    - Portfolio: ${profile.portfolioUrl || 'OMIT'}
    - Education: ${JSON.stringify(profile.education)}
    - Experience: ${JSON.stringify(profile.experience)}
    - Skills: ${profile.skills.join(', ')}
    - Certifications: ${profile.certifications.join(', ')}
    - Languages: ${profile.languages.join(', ')}
    `

    // --- STEP 1: TAILOR CV ---
    const cvPrompt = `
    You are an expert career documents specialist and ATS strategist.
    ${context}

    ### 2. STRATEGIC TAILORING RULES
    - **Mirror the Employer**: Use the EXACT same terminology and keywords from the Job Description.
    - **Prioritize Evidence**: Move relevant experiences to the top.
    - **Quantify Impact**: Use numbers where possible.
    - **ATS Optimization**: Clean structure for machine reading.
    - **CLEAN SECTIONS**: Omit any section (Summary, Experience, Education, Skills, Certifications, Languages) if it has no data.
    - **NO BOLD CATCHWORDS**: Do NOT bold keywords from the job description in the body text.
    - **CLEAN HEADERS**: Exclude missing contact fields. No placeholders.

    ### 3. CV STRUCTURE
    Create a professional CV using this Markdown:
    - **Header**: # [FULL NAME]. Horizontal line (---).
    - **Contact Info**: Email | Phone | Address | LinkedIn | Portfolio. ONLY include fields provided.
    - **Summary**: ## SUMMARY. 3-4 sentence paragraph. Omit if empty.
    - **Experience**: ## EXPERIENCE. For each role: "### **Dates** | **Job Title** | Company Name". 3-5 high-impact bullets. Omit if empty.
    - **Education**: ## EDUCATION. Omit if empty.
    - **Skills**: ## SKILLS. Omit if empty.
    - **Certifications**: ## CERTIFICATIONS. Omit if empty.
    - **Languages**: ## LANGUAGES. Omit if empty.

    ### 4. OUTPUT FORMAT
    Return ONLY a raw JSON object:
    {
      "cv": "FULL MARKDOWN CV HERE"
    }
    `

    // --- STEP 2: TAILOR COVER LETTER ---
    const clPrompt = `
    You are an expert career documents specialist.
    ${context}

    ### 2. RULES
    - **Professional Business Letter Format**: Use a formal structure.
    - **NO BOLD CATCHWORDS**: Do NOT bold keywords from the job description anywhere in the text.
    - **CLEAN CONTACT INFO**: Use the provided user contact details. Omit any that are empty.
    - **Perspective**: Write from the candidate's perspective. Avoid generic AI fluff.

    ### 3. STRUCTURE
    Generate a full Markdown cover letter with this layout:
    1. **Sender Info**: 
       # [FULL NAME]
       
       [Email] | [Phone] | [Address]
       [LinkedIn URL] | [Portfolio URL]
       
       (ONLY include fields that have data. Separate items with vertical bars. Add an empty line after the name and after the contact details).
    2. **Horizontal Line**: ---
    3. **Date & Recipient**: 
       ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
       
       Hiring Manager  
       ${profile.experience?.[0]?.company || 'The Hiring Team'}
       
    4. **Salutation**: Dear Hiring Manager,
    5. **Intro**: State the candidate's interest in the position and why they are excited about this specific role.
    6. **Body Paragraph 1 (The Hook)**: Focus on a specific high-impact achievement from the user profile that solves a "Pain Point" in the job description.
    7. **Body Paragraph 2 (The Proof)**: Connect more skills/experiences directly to the requirements.
    8. **Body Paragraph 3 (The Why)**: Why this company? Why now? Show deep understanding of their mission.
    9. **Closing**: Call to action (interview request).
    10. **Sign-off**:  
        Yours sincerely,  
        
        [FULL NAME]

    ### 4. OUTPUT FORMAT
    Return ONLY a raw JSON object:
    {
      "coverLetter": "FULL MARKDOWN COVER LETTER HERE"
    }
    `

    try {
        // Run sequentially to stay within free-tier limits
        const cvResult = await model.generateContent(cvPrompt)
        const cvText = cvResult.response.text()
        const cvData = JSON.parse(cvText.match(/\{[\s\S]*\}/)?.[0] || cvText)

        const clResult = await model.generateContent(clPrompt)
        const clText = clResult.response.text()
        const clData = JSON.parse(clText.match(/\{[\s\S]*\}/)?.[0] || clText)

        return {
            cv: cvData.cv || '',
            coverLetter: clData.coverLetter || ''
        }
    } catch (e) {
        console.error('Tailoring Stepwise Error:', e)
        throw e
    }
}
