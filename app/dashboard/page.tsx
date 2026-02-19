'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import JobCard from '@/components/JobCard'
import Sidebar from '@/components/Sidebar'
import { Search, RefreshCcw, Filter, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function DashboardPage() {
    const router = useRouter()
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('Software Engineer')
    const [locationQuery, setLocationQuery] = useState('Dublin')
    const [platform, setPlatform] = useState('indeed')
    const [dateFilter, setDateFilter] = useState('all')
    const [page, setPage] = useState(0)
    const [hasMore, setHasMore] = useState(true)
    const pageSize = 20
    const [tailoringId, setTailoringId] = useState<string | null>(null)

    const fetchJobs = async (pageNum = 0, isLoadMore = false) => {
        if (!isLoadMore) {
            setRefreshing(true)
            if (pageNum === 0) setLoading(true)
        }
        const from = pageNum * pageSize
        const to = (pageNum + 1) * pageSize - 1

        const { data, error, count } = await supabase
            .from('jobs')
            .select('*, tailored_documents(status)', { count: 'exact' })
            .order('scraped_at', { ascending: false })
            .range(from, to)

        if (error) {
            console.error('Fetch error:', error)
        } else {
            if (isLoadMore) {
                setJobs(prev => [...prev, ...(data || [])])
            } else {
                setJobs(data || [])
            }
            setHasMore(count ? (pageNum + 1) * pageSize < count : false)
        }
        setRefreshing(false)
        setLoading(false)
    }

    const handleLoadMore = () => {
        const nextPage = page + 1
        setPage(nextPage)
        fetchJobs(nextPage, true)
    }

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                router.push('/login')
                return
            }
            fetchJobs(0)
        }
        checkAuthAndFetch()
    }, [])

    const handleTailor = async (jobId: string) => {
        setTailoringId(jobId)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                toast.error('Please sign in to tailor applications.')
                return
            }

            const { data: { session } } = await supabase.auth.getSession()
            const response = await fetch('/api/tailor', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ profileId: user.id, jobId })
            })

            const rawText = await response.text()
            let responseData
            try {
                responseData = JSON.parse(rawText)
            } catch (e) {
                throw new Error(`Server error (${response.status})`)
            }

            if (!response.ok) {
                throw new Error(responseData.error || 'Failed to tailor application')
            }

            toast.success('AI Tailoring complete! Check your applications.')
            await fetchJobs()
        } catch (error: any) {
            console.error('Tailoring error:', error)
            toast.error(`Error: ${error.message}`)
        } finally {
            setTailoringId(null)
        }
    }

    const handleScrape = async () => {
        setRefreshing(true)
        try {
            const { data: { session } } = await supabase.auth.getSession()
            const response = await fetch('/api/scrape', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ query: searchQuery, location: locationQuery, platform, dateFilter })
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 429) {
                    toast.error('Rate limit reached. Please wait a few minutes before searching again.')
                } else {
                    toast.error(data.error || 'Failed to search for jobs. Please try again.')
                }
                return
            }

            if (data.count === 0) {
                toast.info('No new jobs found for this search. Try different keywords or location.')
            } else {
                toast.success(`Found ${data.count} new job${data.count > 1 ? 's' : ''}!`)
            }

            await fetchJobs()
        } catch (e: any) {
            console.error('Scrape error:', e)
            toast.error('Failed to search for jobs. Please check your connection and try again.')
        } finally {
            setRefreshing(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans">
            <Sidebar />

            {/* Main Content */}

            {/* Main Content */}
            <main className="flex-1 pl-0 lg:pl-72 min-h-screen pt-16 lg:pt-0 transition-all duration-300">
                <div className="max-w-[1600px] mx-auto p-6 lg:p-12">

                    {/* Header HUD */}
                    <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-8 lg:mb-12 gap-6 lg:gap-8">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight mb-3">Live Opportunities</h1>
                            <p className="text-muted font-medium flex items-center gap-2">
                                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                Monitoring {jobs.length} relevant listings across {Array.from(new Set(jobs.map(j => j.platform))).length || 3} platforms
                            </p>
                        </div>

                        {/* Search & Filter HUD */}
                        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
                            <div className="flex-1 min-w-[240px] glass flex items-center px-4 py-3 rounded-2xl border border-white/10 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                <Search size={18} className="text-muted mr-3" />
                                <input
                                    aria-label="Search position keywords"
                                    type="text"
                                    placeholder="Position keywords..."
                                    className="bg-transparent border-none text-sm focus:outline-none w-full font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="flex-1 min-w-[200px] glass flex items-center px-4 py-3 rounded-2xl border border-white/10 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                <div className="text-primary mr-3 shrink-0 uppercase text-[10px] font-black tracking-widest">Loc</div>
                                <input
                                    aria-label="Search location"
                                    type="text"
                                    placeholder="City or Remote..."
                                    className="bg-transparent border-none text-sm focus:outline-none w-full font-medium"
                                    value={locationQuery}
                                    onChange={(e) => setLocationQuery(e.target.value)}
                                />
                            </div>
                            <div className="glass flex items-center px-4 py-3 rounded-2xl border border-white/10 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                <Filter size={18} className="text-muted mr-3" />
                                <select
                                    aria-label="Filter by platform"
                                    className="bg-transparent border-none text-sm focus:outline-none text-white/80 cursor-pointer appearance-none pr-8 font-bold"
                                    value={platform}
                                    onChange={(e) => setPlatform(e.target.value)}
                                >
                                    <option value="indeed" className="bg-slate-900">Indeed</option>
                                    <option value="linkedin" className="bg-slate-900">LinkedIn</option>
                                </select>
                            </div>
                            <div className="glass flex items-center px-4 py-3 rounded-2xl border border-white/10 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                <Clock size={18} className="text-muted mr-3" />
                                <select
                                    aria-label="Filter by date"
                                    className="bg-transparent border-none text-sm focus:outline-none text-white/80 cursor-pointer appearance-none pr-8 font-bold"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                >
                                    <option value="all" className="bg-slate-900">Any Time</option>
                                    <option value="24h" className="bg-slate-900">Past 24 Hours</option>
                                    <option value="3d" className="bg-slate-900">Past 3 Days</option>
                                    <option value="7d" className="bg-slate-900">Past Week</option>
                                </select>
                            </div>
                            <button
                                onClick={handleScrape}
                                disabled={refreshing}
                                className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black shadow-lg shadow-primary/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                            >
                                <RefreshCcw size={18} className={refreshing ? 'animate-spin' : ''} />
                                {refreshing ? 'Searching...' : 'Search Jobs'}
                            </button>
                        </div>
                    </header>

                    {/* Bento Content Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="h-[280px] glass rounded-3xl border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <>
                            {jobs.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {jobs.map((job) => (
                                        <JobCard
                                            key={job.id}
                                            job={job}
                                            status={job.tailored_documents?.[0]?.status === 'final' ? 'applied' : job.tailored_documents?.length > 0 ? 'tailored' : 'new'}
                                            onTailor={handleTailor}
                                            isTailoring={tailoringId === job.id}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-[3rem] border-dashed border-2 border-white/10">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-muted">
                                        <Search size={40} />
                                    </div>
                                    <h2 className="text-2xl font-black mb-2">Workspace Empty</h2>
                                    <p className="text-muted max-w-sm font-medium">No listings found in your current search radius. Try adjusting your keywords.</p>
                                </div>
                            )}
                        </>
                    )}
                    {/* Load More Control */}
                    {hasMore && jobs.length > 0 && (
                        <div className="mt-12 flex justify-center pb-20">
                            <button
                                onClick={handleLoadMore}
                                disabled={refreshing}
                                className="px-12 py-5 glass border border-white/10 rounded-2xl font-black text-sm uppercase tracking-widest text-primary hover:bg-white/5 transition-all disabled:opacity-50"
                            >
                                {refreshing ? 'Loading Mission Data...' : 'Intercept More Opportunities'}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
