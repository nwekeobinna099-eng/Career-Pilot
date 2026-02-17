import { scrapeJobs } from './lib/scraper.ts'

async function testDateFilter() {
    console.log('Testing Date Filter Logic...')

    // Test Indeed 24h
    console.log('\n--- Testing Indeed (Past 24h) ---')
    await scrapeJobs('React', 'Dublin', 'indeed', '24h')

    // Test LinkedIn 24h
    console.log('\n--- Testing LinkedIn (Past 24h) ---')
    await scrapeJobs('React', 'Dublin', 'linkedin', '24h')
}

testDateFilter()
