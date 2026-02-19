'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { Settings, Shield, Zap, TrendingUp, Loader2, Check } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [profile, setProfile] = useState<any>(null)

    // Controlled fields
    const [fullName, setFullName] = useState('')
    const [threshold, setThreshold] = useState(90)
    const [frequency, setFrequency] = useState('Daily Digest')

    const fetchProfile = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle()

        if (error) {
            console.error('Error fetching profile:', error)
        } else if (data) {
            setProfile(data)
            setFullName(data.full_name || '')
            setThreshold(data.smart_match_threshold || 90)
            setFrequency(data.notification_frequency || 'Daily Digest')
        }
        setLoading(false)
    }

    const handleUpdateProfile = async () => {
        setSaving(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                smart_match_threshold: threshold,
                notification_frequency: frequency
            })
            .eq('id', user.id)

        if (error) {
            console.error('Update error:', error)
            alert('Failed to update mission parameters: ' + error.message)
        } else {
            setSaved(true)
            // Insert notification
            await supabase.from('notifications').insert({
                user_id: user.id,
                title: 'Mission Calibrated',
                message: `Alert parameters updated: Threshold ${threshold}% | Frequency: ${frequency}.`,
                type: 'system',
                priority: 'normal'
            })
            setTimeout(() => setSaved(false), 3000)
        }
        setSaving(false)
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 pl-20 lg:pl-72 h-screen overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8 lg:p-12">
                    <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight mb-3 text-white uppercase">Profile & Control</h1>
                            <p className="text-muted font-medium">Calibrate your AI flight systems and security parameters.</p>
                        </div>
                        {saved && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500/30 rounded-xl text-green-500 text-xs font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-2">
                                <Check size={14} /> Mission Settings Locked
                            </div>
                        )}
                    </header>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-[3rem] border-dashed border-2 border-white/10">
                            <Loader2 size={40} className="text-primary animate-spin mb-4" />
                            <h2 className="text-xl font-black text-white uppercase">Syncing mission data...</h2>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {/* Account Section */}
                            <section className="glass p-8 rounded-[2rem] border border-white/5">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-primary">
                                        <Shield size={24} />
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">Security & Identity</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/5 border border-white/5 rounded-2xl items-center">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted">Primary Pilot Name</label>
                                            <input
                                                type="text"
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                className="w-full bg-transparent border-none focus:ring-0 text-white font-bold p-0 text-lg placeholder:text-white/20"
                                                placeholder="Enter full name"
                                            />
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <button
                                                onClick={handleUpdateProfile}
                                                disabled={saving}
                                                className="px-6 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 border border-primary/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all cursor-pointer text-white flex items-center gap-2"
                                            >
                                                {saving ? <Loader2 size={14} className="animate-spin" /> : <Settings size={14} />}
                                                Save Mission Changes
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Smart Alerts Calibration */}
                            <section className="glass p-8 rounded-[2rem] border border-white/5">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-amber-500">
                                        <TrendingUp size={24} />
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">Alert Calibration</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-end mb-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted">Smart Match Threshold</span>
                                            <span className="text-white font-black">{threshold}%</span>
                                        </div>
                                        <div className="relative pt-1">
                                            <input
                                                type="range"
                                                min="50"
                                                max="100"
                                                step="5"
                                                value={threshold}
                                                onChange={(e) => setThreshold(parseInt(e.target.value))}
                                                className="w-full h-3 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
                                            />
                                            <div className="flex justify-between mt-2">
                                                <span className="text-[8px] font-black text-muted uppercase">Wide Target (50%)</span>
                                                <span className="text-[8px] font-black text-muted uppercase">Precision Orbit (100%)</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-muted font-medium">Only notify me for jobs that exceed this match percentage based on my Universal Profile.</p>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        {['Immediate', 'Daily Digest', 'Weekly'].map((freq) => (
                                            <button
                                                key={freq}
                                                onClick={() => setFrequency(freq)}
                                                className={`p-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest transition-all ${frequency === freq ? 'bg-primary/20 border-primary text-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5 text-muted hover:text-white'}`}
                                            >
                                                {freq}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* AI Flight Systems */}
                            <section className="glass p-8 rounded-[2rem] border border-white/5">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
                                        <Zap size={24} />
                                    </div>
                                    <h2 className="text-xl font-black uppercase tracking-tight">AI Flight Systems</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-6 bg-white/5 border border-white/5 rounded-2xl">
                                        <div>
                                            <div className="font-bold text-white mb-1">Core Neural Engine</div>
                                            <div className="text-xs text-muted font-medium">Gemini 2.5 Flash for orbital tailoring speeds.</div>
                                        </div>
                                        <div className="px-3 py-1 bg-accent/20 text-accent rounded-lg text-[10px] font-black uppercase tracking-widest border border-accent/20">
                                            Optimized
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}

                    <footer className="mt-20 pt-8 border-t border-white/5 text-center">
                        <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">CareerPilot Mission Control v1.5</p>
                    </footer>
                </div>
            </main>
        </div>
    )
}
