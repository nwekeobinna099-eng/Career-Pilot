import { chromium, Browser, BrowserContext, Page } from 'playwright'

export interface JobListing {
    title: string
    company: string
    location: string
    description: string
    url: string
    platform: string
}

/**
 * Connects to a browser instance.
 * Automatically switches between remote Browserless.io and local Chromium.
 */
async function getBrowserInstance(): Promise<{ browser: Browser; isRemote: boolean }> {
    const token = process.env.BROWSERLESS_TOKEN

    if (token) {
        console.log('Connecting to remote browser via Browserless.io...')
        const browser = await chromium.connect(`wss://production-sfo.browserless.io/chromium/playwright?token=${token}`)
        return { browser, isRemote: true }
    }

    console.log('Launching local Chromium instance...')
    const browser = await chromium.launch({ headless: true })
    return { browser, isRemote: false }
}

export async function scrapeIndeed(searchQuery: string, location: string, dateFilter: string = 'all'): Promise<JobListing[]> {
    const { browser, isRemote } = await getBrowserInstance()

    try {
        const context: BrowserContext = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 800 },
            deviceScaleFactor: 1,
        })
        const page: Page = await context.newPage()

        // Extra stealth: set extra headers
        await page.setExtraHTTPHeaders({
            'Accept-Language': 'en-US,en;q=0.9',
            'Upgrade-Insecure-Requests': '1',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-User': '?1',
            'Sec-Fetch-Dest': 'document',
        })

        const dateParam = dateFilter === '24h' ? '&fromage=1' : dateFilter === '3d' ? '&fromage=3' : dateFilter === '7d' ? '&fromage=7' : ''
        const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(searchQuery)}&l=${encodeURIComponent(location)}${dateParam}`

        console.log(`Navigating to Indeed: ${url}`)
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

        // Wait for results or check for CAPTCHA
        try {
            await page.waitForSelector('.job_seen_beacon, #challenge-running, #challenge-stage', { timeout: 20000 })
        } catch (e) {
            console.warn('Timeout waiting for job cards or CAPTCHA.')
        }

        const isBlocked = await page.evaluate(() => {
            return document.body.innerText.includes('Verify you are human') ||
                !!document.querySelector('#challenge-running') ||
                !!document.querySelector('#challenge-stage')
        })

        if (isBlocked) {
            console.error('Indeed blocked the request (CAPTCHA/Challenge detected)')
            return []
        }

        const initialJobs: JobListing[] = await page.evaluate((platformUrl) => {
            const cardElements = document.querySelectorAll('.job_seen_beacon')
            const results: JobListing[] = []

            cardElements.forEach((card) => {
                const titleEl = card.querySelector('h2.jobTitle a') || card.querySelector('h2.jobTitle span[id^="jobTitle"]')
                const companyEl = card.querySelector('[data-testid="company-name"]') || card.querySelector('.companyName')
                const locationEl = card.querySelector('[data-testid="text-location"]') || card.querySelector('.companyLocation')
                const linkEl = card.querySelector('a.jcs-JobTitle') || card.querySelector('h2.jobTitle a')

                if (titleEl && companyEl) {
                    results.push({
                        title: titleEl.textContent?.trim() || 'No Title',
                        company: companyEl.textContent?.trim() || 'Unknown Company',
                        location: locationEl?.textContent?.trim() || 'Remote/Unknown',
                        description: '',
                        url: linkEl ? new URL(linkEl.getAttribute('href') || '', 'https://www.indeed.com').href : platformUrl,
                        platform: 'Indeed'
                    })
                }
            })
            return results
        }, url)

        // Deep dive for descriptions (limit to 5 in remote mode to save credits/time)
        const limit = isRemote ? 5 : 10
        const detailedJobs: JobListing[] = []
        for (const job of initialJobs.slice(0, limit)) {
            try {
                const detailPage = await context.newPage()
                await detailPage.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
                const description = await detailPage.evaluate(() => {
                    const descEl = document.querySelector('#jobDescriptionText')
                    return descEl?.textContent?.trim() || ''
                })
                detailedJobs.push({ ...job, description })
                await detailPage.close()
            } catch (e) {
                detailedJobs.push(job)
            }
        }

        return detailedJobs
    } catch (error) {
        console.error('Error scraping indeed:', error)
        return []
    } finally {
        await browser.close()
    }
}

export async function scrapeLinkedIn(searchQuery: string, location: string, dateFilter: string = 'all'): Promise<JobListing[]> {
    const { browser, isRemote } = await getBrowserInstance()

    try {
        const context: BrowserContext = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
        })
        const page: Page = await context.newPage()

        const dateParam = dateFilter === '24h' ? '&f_TPR=r86400' : dateFilter === '3d' ? '&f_TPR=r259200' : dateFilter === '7d' ? '&f_TPR=r604800' : ''
        const url = `https://www.linkedin.com/jobs/search?keywords=${encodeURIComponent(searchQuery)}&location=${encodeURIComponent(location)}${dateParam}`

        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })
        await page.waitForSelector('.job-search-card', { timeout: 15000 })

        const initialJobs: JobListing[] = await page.evaluate((platformUrl) => {
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

        // Deep dive for descriptions (limit to 5 in remote mode)
        const limit = isRemote ? 5 : 10
        const detailedJobs: JobListing[] = []
        for (const job of initialJobs.slice(0, limit)) {
            try {
                const detailPage = await context.newPage()
                await detailPage.goto(job.url, { waitUntil: 'domcontentloaded', timeout: 30000 })
                const description = await detailPage.evaluate(() => {
                    const descEl = document.querySelector('.description__text') ||
                        document.querySelector('.show-more-less-html__markup') ||
                        document.querySelector('.jobs-description')
                    return descEl?.textContent?.trim() || ''
                })
                detailedJobs.push({ ...job, description })
                await detailPage.close()
            } catch (e) {
                detailedJobs.push(job)
            }
        }

        return detailedJobs
    } catch (error) {
        console.error('Error scraping LinkedIn:', error)
        return []
    } finally {
        await browser.close()
    }
}

export async function scrapeJobs(searchQuery: string, location: string, platform: string = 'indeed', dateFilter: string = 'all'): Promise<JobListing[]> {
    switch (platform.toLowerCase()) {
        case 'linkedin':
            return scrapeLinkedIn(searchQuery, location, dateFilter)
        case 'indeed':
        default:
            return scrapeIndeed(searchQuery, location, dateFilter)
    }
}
