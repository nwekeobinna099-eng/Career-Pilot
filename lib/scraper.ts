import { chromium, Browser, Page } from 'playwright'

export interface JobListing {
    title: string
    company: string
    location: string
    description: string
    url: string
    platform: string
}

export async function scrapeIndeed(searchQuery: string, location: string = 'Dublin', dateFilter: string = 'all'): Promise<JobListing[]> {
    const browser: Browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    })
    const page: Page = await context.newPage()

    // Indeed date filter: fromage parameter
    const dateParam = dateFilter === '24h' ? '&fromage=1' : dateFilter === '3d' ? '&fromage=3' : dateFilter === '7d' ? '&fromage=7' : ''
    const url = `https://ie.indeed.com/jobs?q=${encodeURIComponent(searchQuery)}&l=${encodeURIComponent(location)}${dateParam}`

    try {
        console.log(`Scraping Indeed: ${url}`)
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
        // ... existing indeed logic ...
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
                        description: '',
                        url: linkEl ? `https://ie.indeed.com${linkEl.getAttribute('href')}` : platformUrl,
                        platform: 'Indeed'
                    })
                }
            })

            return results
        }, url)

        return jobs
    } catch (error) {
        console.error('Error scraping indeed:', error)
        return []
    } finally {
        await browser.close()
    }
}

export async function scrapeLinkedIn(searchQuery: string, location: string = 'Dublin', dateFilter: string = 'all'): Promise<JobListing[]> {
    const browser: Browser = await chromium.launch({ headless: true })
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    })
    const page: Page = await context.newPage()

    // LinkedIn date filter: f_TPR parameter (r86400 = 24h, r259200 = 3 days, r604800 = 7 days)
    const dateParam = dateFilter === '24h' ? '&f_TPR=r86400' : dateFilter === '3d' ? '&f_TPR=r259200' : dateFilter === '7d' ? '&f_TPR=r604800' : ''
    const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}${dateParam}`

    try {
        console.log(`Scraping LinkedIn: ${url}`)
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

        await page.waitForSelector('.job-search-card', { timeout: 15000 })

        const jobs: JobListing[] = await page.evaluate((platformUrl) => {
            const cardElements = document.querySelectorAll('.job-search-card')
            const results: JobListing[] = []

            cardElements.forEach((card) => {
                const titleEl = card.querySelector('.base-search-card__title')
                const companyEl = card.querySelector('.base-search-card__subtitle')
                const locationEl = card.querySelector('.job-search-card__location')
                const linkEl = card.querySelector('.base-card__full-link')

                if (titleEl && companyEl) {
                    results.push({
                        title: titleEl.textContent?.trim() || 'No Title',
                        company: companyEl.textContent?.trim() || 'Unknown Company',
                        location: locationEl?.textContent?.trim() || 'Remote/Unknown',
                        description: '',
                        url: linkEl?.getAttribute('href') || platformUrl,
                        platform: 'LinkedIn'
                    })
                }
            })

            return results
        }, url)

        return jobs
    } catch (error) {
        console.error('Error scraping LinkedIn:', error)
        return []
    } finally {
        await browser.close()
    }
}

export async function scrapeJobs(searchQuery: string, location: string = 'Dublin', platform: string = 'indeed', dateFilter: string = 'all'): Promise<JobListing[]> {
    console.log(`Routing scrape request for ${platform} | Filter: ${dateFilter} | Query: ${searchQuery}`)
    switch (platform.toLowerCase()) {
        case 'linkedin':
            return scrapeLinkedIn(searchQuery, location, dateFilter)
        case 'indeed':
        default:
            return scrapeIndeed(searchQuery, location, dateFilter)
    }
}
