'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { TrendingUp, Target, Users, Globe, ExternalLink, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function AnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState<any[]>([])
    const [platformDistribution, setPlatformDistribution] = useState<any[]>([])
    const [velocityData, setVelocityData] = useState<number[]>([])

    const fetchAnalytics = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: applications, error } = await supabase
            .from('tailored_documents')
            .select(`
                id,
                created_at,
                jobs (
                    platform
                )
            `)
            .eq('user_id', user.id)

        if (error) {
            console.error('Error fetching analytics:', error)
            setLoading(false)
            return
        }

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        const apps = applications || []
        const totalApps = apps.length

        // 1. Calculate Profile Optimization (Completeness)
        const profileFields = [
            profile?.full_name, profile?.email, profile?.phone, profile?.address,
            profile?.educational_background?.length, profile?.work_experience?.length,
            profile?.skills?.length, profile?.certifications?.length
        ]
        const filledFields = profileFields.filter(f => f && (Array.isArray(f) ? f.length > 0 : true)).length
        const optimizationScore = Math.round((filledFields / profileFields.length) * 100)

        // 2. Calculate Tailored Index (Applications / Profile Strength)
        const tailoredIndex = totalApps > 0 ? Math.min(100, Math.round((totalApps / 10) * optimizationScore)) : 0
        const platforms = new Set(apps.map((a: any) => a.jobs?.platform).filter(Boolean))

        setStats([
            { label: 'Total Applications', value: totalApps.toString(), change: '+Active', icon: <Target size={20} />, color: 'text-primary' },
            { label: 'Optimization Score', value: `${optimizationScore}%`, change: optimizationScore > 70 ? 'High' : 'Improving', icon: <TrendingUp size={20} />, color: 'text-green-500' },
            { label: 'Alignment Index', value: `${tailoredIndex}%`, change: tailoredIndex > 80 ? 'Elite' : 'Target', icon: <Users size={20} />, color: 'text-accent' },
            { label: 'Active Platforms', value: platforms.size.toString(), change: 'Multi-Hub', icon: <Globe size={20} />, color: 'text-purple-400' },
        ])

        // 2. Platform Distribution
        const platformCounts: Record<string, number> = {}
        apps.forEach((a: any) => {
            const p = a.jobs?.platform || 'Unknown'
            platformCounts[p] = (platformCounts[p] || 0) + 1
        })

        const distribution = Object.entries(platformCounts).map(([name, count]) => ({
            name,
            value: totalApps > 0 ? Math.round((count / totalApps) * 100) : 0,
            color: name === 'LinkedIn' ? 'bg-primary' : name === 'Indeed' ? 'bg-accent' : name === 'Glassdoor' ? 'bg-green-500' : 'bg-indigo-400'
        })).sort((a, b) => b.value - a.value)

        setPlatformDistribution(distribution)

        // 3. Application Velocity (Last 12 Months)
        const months = new Array(12).fill(0)
        const now = new Date()
        apps.forEach((a: any) => {
            const date = new Date(a.created_at)
            const diffMonths = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
            if (diffMonths < 12) {
                months[11 - diffMonths]++
            }
        })
        setVelocityData(months)

        setLoading(false)
    }

    useEffect(() => {
        fetchAnalytics()
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 pl-20 lg:pl-72 h-screen overflow-y-auto">
                <div className="max-w-6xl mx-auto p-8 lg:p-12">
                    <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight mb-3 text-white uppercase">Career Analytics</h1>
                            <p className="text-muted font-medium">Data-driven insights into your professional ascent.</p>
                        </div>
                        <div className="flex gap-3">
                            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all cursor-pointer">
                                Export Data
                            </button>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-[3rem] border-dashed border-2 border-white/10">
                            <Loader2 size={40} className="text-primary animate-spin mb-4" />
                            <h2 className="text-xl font-black text-white uppercase">Calculating mission data...</h2>
                        </div>
                    ) : (
                        <>
                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                                {stats.map((stat, i) => (
                                    <div key={i} className="glass p-6 rounded-3xl border border-white/5 group hover:border-white/20 transition-all">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 ${stat.color}`}>
                                                {stat.icon}
                                            </div>
                                            <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg bg-white/5 ${stat.change.startsWith('+') || stat.change === 'Active' ? 'text-green-500' : 'text-muted'}`}>
                                                {stat.change}
                                            </span>
                                        </div>
                                        <div className="text-3xl font-black text-white mb-1 uppercase tracking-tight">{stat.value}</div>
                                        <div className="text-muted text-[10px] font-black uppercase tracking-widest">{stat.label}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                {/* Platform Distribution */}
                                <div className="lg:col-span-1 glass p-8 rounded-[2.5rem] border border-white/5">
                                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Platform Mix</h3>
                                    <div className="space-y-6">
                                        {platformDistribution.length > 0 ? platformDistribution.map((platform, i) => (
                                            <div key={i} className="space-y-2">
                                                <div className="flex justify-between items-end">
                                                    <span className="text-xs font-black uppercase tracking-widest text-white">{platform.name}</span>
                                                    <span className="text-xs font-bold text-muted">{platform.value}%</span>
                                                </div>
                                                <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${platform.color} transition-all duration-1000`}
                                                        style={{ width: `${platform.value}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )) : (
                                            <p className="text-muted text-xs">No platform data available.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Success Timeline */}
                                <div className="lg:col-span-2 glass p-8 rounded-[2.5rem] border border-white/5 relative overflow-hidden flex flex-col justify-between">
                                    <div className="relative z-10 w-full">
                                        <h3 className="text-xl font-black text-white uppercase tracking-tight mb-2">Application Velocity</h3>
                                        <p className="text-muted text-xs font-medium mb-8">Monthly volume across your mission timeline.</p>

                                        <div className="h-48 w-full flex items-end gap-2 px-2">
                                            {velocityData.map((count, i) => (
                                                <div key={i} className="flex-1 group relative">
                                                    <div
                                                        className="w-full bg-primary/20 rounded-t-lg group-hover:bg-primary/40 transition-all cursor-pointer"
                                                        style={{ height: `${Math.max(5, (count / (Math.max(...velocityData) || 1)) * 100)}%` }}
                                                    />
                                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-primary px-2 py-1 rounded text-[8px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                                        {count} Applications
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex justify-between mt-4 px-2">
                                            <span className="text-[8px] font-black text-muted uppercase">Past Year</span>
                                            <span className="text-[8px] font-black text-primary uppercase">Current Month</span>
                                        </div>
                                    </div>

                                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 blur-3xl rounded-full -mr-32 -mb-32" />
                                </div>
                            </div>

                            {/* Pro Insight Card */}
                            <div className="mt-12 glass p-10 rounded-[3rem] border border-white/5 bg-gradient-to-br from-primary/5 to-transparent flex items-center gap-10">
                                <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center text-primary shrink-0">
                                    <TrendingUp size={40} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">AI Optimization Insight</h3>
                                    <p className="text-muted font-medium mb-4 max-w-2xl text-lg">
                                        Your precision-tailored documents have a theoretical match index of 94%.
                                        {platformDistribution.length > 0 && ` Your primary hunting ground is ${platformDistribution[0].name}.`}
                                    </p>
                                    <button className="flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest hover:gap-3 transition-all">
                                        See Detailed Keyword Breakdown <ExternalLink size={14} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    <footer className="mt-20 pt-8 border-t border-white/5 text-center">
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">CareerPilot Intelligence Suite v1.5</p>
                    </footer>
                </div>
            </main>
        </div>
    )
}
