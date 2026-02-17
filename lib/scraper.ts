import { chromium, Browser, Page } from 'playwright'

export interface JobListing {
    title: string
    company: string
    location: string
    description: string
    url: string
    platform: string
}

export async function scrapeIndeed(searchQuery: string, location: string = 'Dublin'): Promise<JobListing[]> {
    const browser: Browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    })
    const page: Page = await context.newPage()

    const url = `https://ie.indeed.com/jobs?q=${encodeURIComponent(searchQuery)}&l=${encodeURIComponent(location)}`

    try {
        console.log(`Scraping: ${url}`)
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

        // Wait for the job card containers
        await page.waitForSelector('.resultContent', { timeout: 10000 })

        const jobs: JobListing[] = await page.evaluate((platformUrl) => {
            const cardElements = document.querySelectorAll('.resultContent')
            const results: JobListing[] = []

            cardElements.forEach((card) => {
                const titleEl = card.querySelector('h2.jobTitle span[title]') || card.querySelector('h2.jobTitle a')
                const companyEl = card.querySelector('[data-testid="company-name"]')
                const locationEl = card.querySelector('[data-testid="text-location"]')
                const linkEl = card.querySelector('h2.jobTitle a')

                if (titleEl && companyEl) {
                    results.push({
                        title: titleEl.textContent?.trim() || 'No Title',
                        company: companyEl.textContent?.trim() || 'Unknown Company',
                        location: locationEl?.textContent?.trim() || 'Remote/Unknown',
                        description: '', // Desc usually requires clicking or separate page
                        url: linkEl ? `https://ie.indeed.com${linkEl.getAttribute('href')}` : platformUrl,
                        platform: 'Indeed'
                    })
                }
            })

            return results
        }, url)

        // Optionally: Visit each job page to get the full description
        // For now, let's just return the basic info to verify it works
        return jobs
    } catch (error) {
        console.error('Error scraping indeed:', error)
        return []
    } finally {
        await browser.close()
    }
}

export async function scrapeLinkedIn(searchQuery: string): Promise<JobListing[]> {
    // Basic placeholder for LinkedIn - LinkedIn is much harder due to auth/bot detection
    return []
}
