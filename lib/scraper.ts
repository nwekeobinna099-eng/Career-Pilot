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
 * Added support for platform-specific rotation and stealth flags.
 */
async function getBrowserInstance(platform?: string): Promise<{ browser: Browser; isRemote: boolean }> {
    const token = process.env.BROWSERLESS_TOKEN

    if (token) {
        // Indeed is extremely aggressive with US datacenter IPs. 
        // London often has different rate limits and flagging.
        const region = platform?.toLowerCase() === 'indeed' ? 'production-lon' : 'production-sfo'
        console.log(`Connecting to remote browser via Browserless.io (${region})...`)

        // Added --disable-blink-features=AutomationControlled to hide Playwright presence further
        const browser = await chromium.connect(`wss://${region}.browserless.io/chromium/playwright?token=${token}&stealth&--disable-blink-features=AutomationControlled`)
        return { browser, isRemote: true }
    }

    console.log('Launching local Chromium instance...')
    const browser = await chromium.launch({ headless: true })
    return { browser, isRemote: false }
}

export async function scrapeIndeed(searchQuery: string, location: string, dateFilter: string = 'all'): Promise<JobListing[]> {
    const { browser, isRemote } = await getBrowserInstance('indeed')

    try {
        const context: BrowserContext = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
            viewport: { width: 1280, height: 800 },
        })
        const page: Page = await context.newPage()

        const dateParam = dateFilter === '24h' ? '&fromage=1' : dateFilter === '3d' ? '&fromage=3' : dateFilter === '7d' ? '&fromage=7' : ''
        const url = `https://www.indeed.com/jobs?q=${encodeURIComponent(searchQuery)}&l=${encodeURIComponent(location)}${dateParam}`

        console.log(`Navigating to Indeed: ${url}`)
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 })

        // Wait longer for Cloudflare to potentially resolve
        console.log('Waiting 10 seconds for Cloudflare/scripts...')
        await page.waitForTimeout(10000)

        // Wait for results or check for CAPTCHA
        try {
            await page.waitForSelector('.job_seen_beacon, .resultContent, .jobTitle, #challenge-running, #challenge-stage', { timeout: 15000 })
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
            // Priority 1: Check for Mosaic JSON data (most robust)
            const scriptTag = Array.from(document.querySelectorAll('script')).find(s => s.textContent?.includes('window.mosaic.providerData["mosaic-provider-jobcards"]'))
            if (scriptTag?.textContent) {
                try {
                    const match = scriptTag.textContent.match(/window\.mosaic\.providerData\["mosaic-provider-jobcards"\]\s*=\s*({.*?});/s)
                    if (match && match[1]) {
                        const data = JSON.parse(match[1])
                        const jobCards = data.metaData?.mosaicProviderJobCardsModel?.results || []
                        if (jobCards.length > 0) {
                            return jobCards.map((job: any) => ({
                                title: job.title || 'No Title',
                                company: job.company || 'Unknown Company',
                                location: job.formattedLocation || 'Remote/Unknown',
                                description: '',
                                url: job.viewJobLink ? new URL(job.viewJobLink, 'https://www.indeed.com').href : platformUrl,
                                platform: 'Indeed'
                            }))
                        }
                    }
                } catch (e) {
                    console.error('Error parsing mosaic JSON:', e)
                }
            }

            // Priority 2: DOM selectors (classic)
            const cardElements = document.querySelectorAll('.job_seen_beacon, .resultContent')
            const results: JobListing[] = []

            cardElements.forEach((card) => {
                const titleEl = card.querySelector('h2.jobTitle a') || card.querySelector('h2.jobTitle span[id^="jobTitle"]') || card.querySelector('a')
                const companyEl = card.querySelector('[data-testid="company-name"]') || card.querySelector('.companyName') || card.querySelector('.company')
                const locationEl = card.querySelector('[data-testid="text-location"]') || card.querySelector('.companyLocation') || card.querySelector('.location')
                const linkEl = card.querySelector('a.jcs-JobTitle') || card.querySelector('h2.jobTitle a') || card.querySelector('a')

                if (titleEl && companyEl) {
                    const url = linkEl?.getAttribute('href')
                    results.push({
                        title: titleEl.textContent?.trim() || 'No Title',
                        company: companyEl.textContent?.trim() || 'Unknown Company',
                        location: locationEl?.textContent?.trim() || 'Remote/Unknown',
                        description: '',
                        url: url ? new URL(url, 'https://www.indeed.com').href : platformUrl,
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
    const { browser, isRemote } = await getBrowserInstance('linkedin')

    try {
        const context: BrowserContext = await browser.newContext({
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
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
