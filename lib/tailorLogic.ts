import openai from './openai'

export interface TailoringInput {
    profile: {
        fullName: string
        education: any[]
        experience: any[]
        skills: string[]
        certifications: string[]
    }
    jobDescription: string
}

export async function tailorApplication(input: TailoringInput) {
    const { profile, jobDescription } = input

    const prompt = `
    You are an expert career coach and ATS (Applicant Tracking System) specialist.
    Your task is to tailor a CV and a Cover Letter for the following job description based on the provided user profile.
    
    JOB DESCRIPTION:
    ${jobDescription}
    
    USER PROFILE:
    - Name: ${profile.fullName}
    - Education: ${JSON.stringify(profile.education)}
    - Experience: ${JSON.stringify(profile.experience)}
    - Skills: ${profile.skills.join(', ')}
    - Certifications: ${profile.certifications.join(', ')}
    
    INSTRUCTIONS:
    1. Create a tailored CV that highlights relevant experience and skills mentioned in the job description.
    2. Write a professional Cover Letter that connects the user's background to the company's needs.
    3. Ensure the output is ATS-friendly and professional.
    
    Return the result as a JSON object with the following structure:
    {
      "cv": "The tailored CV content in Markdown format",
      "coverLetter": "The professional Cover Letter in Markdown format"
    }
  `

    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            { role: 'system', content: 'You are a professional career document specialist.' },
            { role: 'user', content: prompt }
        ],
        response_format: { type: 'json_object' }
    })

    const content = response.choices[0].message.content
    if (!content) throw new Error('Failed to generate tailored documents')

    return JSON.parse(content)
}
