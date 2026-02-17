'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import JobCard from '@/components/JobCard'
import { LayoutDashboard, Briefcase, User, Search, RefreshCcw, Bell, Settings, LogOut, ChevronRight, Filter, Zap, Clock } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
    const [jobs, setJobs] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [searchQuery, setSearchQuery] = useState('Software Engineer')
    const [locationQuery, setLocationQuery] = useState('Dublin')
    const [platform, setPlatform] = useState('indeed')
    const [dateFilter, setDateFilter] = useState('all')

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
        console.log('Tailoring job:', jobId)
        alert('AI Tailoring initiated! In a live environment, this calls /api/tailor')
    }

    const handleScrape = async () => {
        setRefreshing(true)
        try {
            await fetch('/api/scrape', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: searchQuery, location: locationQuery, platform, dateFilter })
            })
            await fetchJobs()
        } catch (e) {
            console.error(e)
        } finally {
            setRefreshing(false)
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans">
            {/* Slim Premium Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-20 lg:w-72 glass border-r border-white/5 flex flex-col items-center lg:items-start py-8 z-50">
                <div className="px-6 mb-12 flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                        <Zap size={20} className="text-white fill-white" />
                    </div>
                    <span className="text-xl font-black tracking-tighter uppercase hidden lg:block">CareerPilot</span>
                </div>

                <nav className="flex-1 w-full px-4 space-y-2">
                    {[
                        { icon: <LayoutDashboard size={22} />, label: 'Dashboard', active: true, href: '/dashboard' },
                        { icon: <Briefcase size={22} />, label: 'My Applications', active: false, href: '#' },
                        { icon: <User size={22} />, label: 'Universal Profile', active: false, href: '/profile' },
                        { icon: <Bell size={22} />, label: 'Alerts', active: false, href: '#' },
                    ].map((item, i) => (
                        <Link
                            key={i}
                            href={item.href}
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer group ${item.active ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-muted hover:bg-white/5 hover:text-white'}`}
                        >
                            <div className={`${item.active ? 'text-primary' : 'group-hover:text-white'}`}>{item.icon}</div>
                            <span className="hidden lg:block text-sm uppercase tracking-wide">{item.label}</span>
                        </Link>
                    ))}
                </nav>

                <div className="w-full px-4 mt-auto pt-8 border-t border-white/5 space-y-2">
                    <button className="flex items-center gap-4 p-4 rounded-2xl text-muted hover:bg-white/5 hover:text-white transition-all w-full cursor-pointer">
                        <Settings size={22} />
                        <span className="hidden lg:block text-sm uppercase tracking-wide">Settings</span>
                    </button>
                    <button className="flex items-center gap-4 p-4 rounded-2xl text-muted hover:bg-red-500/10 hover:text-red-400 transition-all w-full cursor-pointer">
                        <LogOut size={22} />
                        <span className="hidden lg:block text-sm uppercase tracking-wide font-bold">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 pl-20 lg:pl-72 min-h-screen">
                <div className="max-w-[1600px] mx-auto p-8 lg:p-12">

                    {/* Header HUD */}
                    <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-12 gap-8">
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
                                    type="text"
                                    placeholder="Position keywords..."
                                    className="bg-transparent border-none text-sm focus:outline-none w-full font-medium"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="glass flex items-center px-4 py-3 rounded-2xl border border-white/10 focus-within:ring-2 focus-within:ring-primary/50 transition-all">
                                <Filter size={18} className="text-muted mr-3" />
                                <select
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
                </div>
            </main>
        </div>
    )
}
