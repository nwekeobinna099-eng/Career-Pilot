import { scrapeGlassdoor } from './lib/scraper.ts'

async function testGlassdoor() {
    console.log('Testing Glassdoor Scraper...')
    try {
        const jobs = await scrapeGlassdoor('Software Engineer', 'Dublin')
        console.log(`Found ${jobs.length} jobs on Glassdoor.`)
        if (jobs.length > 0) {
            console.log('Sample Job:', JSON.stringify(jobs[0], null, 2))
        } else {
            console.log('No jobs found. Glassdoor might be blocking or selectors changed.')
        }
    } catch (e) {
        console.error('Test failed:', e)
    }
}

testGlassdoor()
