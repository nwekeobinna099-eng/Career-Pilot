import { scrapeLinkedIn } from './lib/scraper.ts'

async function testLinkedIn() {
    console.log('Testing LinkedIn Scraper...')
    try {
        const jobs = await scrapeLinkedIn('React Developer', 'Dublin')
        console.log(`Found ${jobs.length} jobs on LinkedIn.`)
        if (jobs.length > 0) {
            console.log('Sample Job:', JSON.stringify(jobs[0], null, 2))
        } else {
            console.log('No jobs found. Check selectors or LinkedIn public access.')
        }
    } catch (e) {
        console.error('Test failed:', e)
    }
}

testLinkedIn()
