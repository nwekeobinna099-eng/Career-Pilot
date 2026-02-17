'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import JobCard from '@/components/JobCard'
import { LayoutDashboard, Briefcase, User, Search, RefreshCcw } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('Software Engineer')
    const [locationQuery, setLocationQuery] = useState('Dublin')

    const fetchJobs = async () => {
        setLoading(true)
        const { data } = await supabase
            .from('jobs')
            .select('*, tailored_documents(status)')
            .order('scraped_at', { ascending: false })

        setJobs(data || [])
        setLoading(false)
    }

    useEffect(() => {
        fetchJobs()
    }, [])

    const handleTailor = async (jobId: string) => {
        // In a real app, we'd trigger the API route we built in Task 6
        console.log('Tailoring job:', jobId)
        // For demo purposes, we'll just show an alert
        alert('AI Tailoring initiated! In a live environment, this calls /api/tailor')
    }

    const handleScrape = async () => {
        setRefreshing(true)
        // Trigger /api/scrape
        try {
            await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery, location: locationQuery })
            })
            await fetchJobs()
        } catch (e) {
            console.error(e)
        } finally {
            setRefreshing(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#0a0a0c] text-white font-sans">
            {/* Sidebar / Nav */}
            <nav className="fixed left-0 top-0 h-full w-20 md:w-64 bg-white/5 border-r border-white/10 flex flex-col items-center py-8 z-50">
                <div className="text-2xl font-black mb-12 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent hidden md:block uppercase tracking-tighter">
                    CAREERPILOT
                </div>
                <div className="space-y-4 w-full px-4">
                    <Link href="/dashboard" className="flex items-center gap-4 p-4 bg-white/10 rounded-2xl text-blue-400 font-bold transition-all w-full">
                        <LayoutDashboard size={24} /> <span className="hidden md:block">Dashboard</span>
                    </Link>
                    <Link href="/profile" className="flex items-center gap-4 p-4 hover:bg-white/5 rounded-2xl text-white/60 font-medium transition-all w-full">
                        <User size={24} /> <span className="hidden md:block">Profile</span>
                    </Link>
                </div>
            </nav>

            <main className="pl-20 md:pl-64 pt-8 p-8">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2">Job Opportunities</h1>
                        <p className="text-white/40">Track and tailor your applications in one place.</p>
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                            <div className="flex items-center pl-4 text-white/40">
                                <Search size={18} />
                            </div>
                            <input
                                type="text"
                                placeholder="Job Title"
                                className="bg-transparent border-none px-4 py-3 text-sm focus:outline-none w-full md:w-48"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                            <input
                                type="text"
                                placeholder="Location"
                                className="bg-transparent border-none px-4 py-3 text-sm focus:outline-none w-full md:w-40"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleScrape}
                            disabled={refreshing}
                            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 min-w-[140px]"
                        >
                            <RefreshCcw size={18} className={refreshing ? 'animate-spin' : ''} />
                            {refreshing ? 'Scraping...' : 'Fetch Jobs'}
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-64 bg-white/5 animate-pulse rounded-2xl border border-white/10"></div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                status={job.tailored_documents?.[0]?.status === 'final' ? 'applied' : job.tailored_documents?.length > 0 ? 'tailored' : 'new'}
                                onTailor={handleTailor}
                            />
                        ))}
                    </div>
                )}

                {jobs.length === 0 && !loading && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <Search size={48} className="text-white/20 mb-4" />
                        <h2 className="text-xl font-bold text-white/60">No jobs found</h2>
                        <p className="text-white/40 mt-2">Click "Fetch New Jobs" to start your search.</p>
                    </div>
                )}
            </main>
        </div>
    )
}
