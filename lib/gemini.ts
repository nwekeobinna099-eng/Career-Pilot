import { GoogleGenerativeAI } from '@google/generative-ai'

const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing from environment variables')
    }
    return new GoogleGenerativeAI(apiKey)
}

export default getGeminiClient
