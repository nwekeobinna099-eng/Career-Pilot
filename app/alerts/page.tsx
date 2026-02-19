'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { Bell, Star, Search, Zap, Loader2, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function AlertsPage() {
    const [filter, setFilter] = useState<'all' | 'high'>('all')
    const [alerts, setAlerts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    const fetchNotifications = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching notifications:', error)
        } else {
            setAlerts(data || [])
        }
        setLoading(false)
    }

    const handleClearAll = async () => {
        if (!confirm('Are you sure you want to clear all alerts? This action cannot be undone.')) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('user_id', user.id)

        if (error) {
            console.error('Clear all error:', error)
        } else {
            setAlerts([])
        }
    }

    const handleDeleteAlert = async (id: string) => {
        const { error } = await supabase
            .from('notifications')
            .delete()
            .eq('id', id)

        if (error) {
            console.error('Delete error:', error)
        } else {
            setAlerts(prev => prev.filter(a => a.id !== id))
        }
    }

    const formatRelativeTime = (dateStr: string) => {
        const now = new Date()
        const date = new Date(dateStr)
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (diffInSeconds < 60) return 'Just now'
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        return date.toLocaleDateString()
    }

    useEffect(() => {
        fetchNotifications()
    }, [])

    const filteredAlerts = filter === 'high' ? alerts.filter(a => a.priority === 'high') : alerts

    const getIcon = (type: string, priority: string) => {
        if (priority === 'high') return <Star size={20} className="fill-amber-400" />
        if (type === 'scrape') return <Search size={20} className="text-primary" />
        if (type === 'job') return <Zap size={20} className="fill-primary" />
        return <Bell size={20} className="text-primary" />
    }

    const getColorClasses = (type: string, priority: string) => {
        if (priority === 'high') return { color: 'text-amber-400', bg: 'bg-amber-400/10' }
        if (type === 'scrape') return { color: 'text-primary', bg: 'bg-primary/10' }
        return { color: 'text-primary', bg: 'bg-primary/10' }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 pl-0 lg:pl-72 min-h-screen pt-16 lg:pt-0 transition-all duration-300 overflow-y-auto">
                <div className="max-w-4xl mx-auto p-6 lg:p-12">
                    <header className="mb-8 lg:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 text-center md:text-left">
                        <div className="w-full md:w-auto">
                            <h1 className="text-4xl font-black tracking-tight mb-3 text-white uppercase">Alerts Center</h1>
                            <p className="text-muted font-medium text-sm sm:text-base">Real-time intelligence on your career journey.</p>
                        </div>

                        <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/5 overflow-x-auto max-w-full mx-auto md:mx-0 shrink-0">
                            <button
                                onClick={() => setFilter('all')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-primary text-white shadow-lg' : 'text-muted hover:text-white'}`}
                            >
                                All Alerts
                            </button>
                            <button
                                onClick={() => setFilter('high')}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === 'high' ? 'bg-amber-500 text-white shadow-lg' : 'text-muted hover:text-white'}`}
                            >
                                High Match
                            </button>
                            <div className="w-px bg-white/10 mx-1 self-stretch" />
                            <button
                                onClick={handleClearAll}
                                className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 hover:text-red-300 hover:bg-red-400/10 transition-all"
                            >
                                Clear All
                            </button>
                        </div>
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-[3rem] border-dashed border-2 border-white/10">
                            <Loader2 size={40} className="text-primary animate-spin mb-4" />
                            <h2 className="text-xl font-black text-white uppercase">Scanning frequencies...</h2>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAlerts.length > 0 ? filteredAlerts.map((alert) => {
                                const styles = getColorClasses(alert.type, alert.priority)
                                return (
                                    <div key={alert.id} className="glass p-6 rounded-3xl border border-white/5 hover:border-white/20 transition-all flex items-start gap-6 relative overflow-hidden group">
                                        <div className={`w-14 h-14 ${styles.bg} rounded-2xl flex items-center justify-center border border-white/10 ${styles.color}`}>
                                            {getIcon(alert.type, alert.priority)}
                                        </div>
                                        <div className="flex-1 pt-1">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="text-lg font-black text-white uppercase tracking-tight">{alert.title}</h3>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-[10px] font-black text-muted uppercase tracking-widest">{formatRelativeTime(alert.created_at)}</span>
                                                    <button
                                                        onClick={() => handleDeleteAlert(alert.id)}
                                                        className="text-muted hover:text-red-500 transition-colors"
                                                        title="Dismiss"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className="text-muted font-medium leading-relaxed">{alert.message}</p>
                                        </div>
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
                                    </div>
                                )
                            }) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-[3rem] border-dashed border-2 border-white/10">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-muted">
                                        <Bell size={40} />
                                    </div>
                                    <h2 className="text-2xl font-black mb-2 text-white uppercase">All Quiet</h2>
                                    <p className="text-muted max-w-sm font-medium">No new alerts. Your pilot systems are performing optimally.</p>
                                </div>
                            )}
                        </div>
                    )}

                    <footer className="mt-20 pt-8 border-t border-white/5 text-center">
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">CareerPilot Intelligence Core v4.0</p>
                    </footer>
                </div>
            </main>
        </div>
    )
}
