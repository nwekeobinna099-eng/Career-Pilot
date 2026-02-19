'use client'

import React, { useEffect, useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { Zap, Check, ArrowRight, Shield, Rocket, Target, Star, Infinity as InfinityIcon } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { PLANS, checkUsage } from '@/lib/plans'

export default function PlansPage() {
    const [usage, setUsage] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchUsage = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const scrapeUsage = await checkUsage(supabase, user.id, 'scrape')
            const tailorUsage = await checkUsage(supabase, user.id, 'tailor')

            setUsage({
                scrape: scrapeUsage,
                tailor: tailorUsage,
                plan: scrapeUsage.plan
            })
            setLoading(false)
        }
        fetchUsage()
    }, [])

    const UsageBar = ({ label, used, limit, icon: Icon }: any) => {
        const percentage = limit === Infinity ? 0 : Math.min((used / limit) * 100, 100)

        return (
            <div className="glass p-6 rounded-3xl border border-white/5">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <Icon size={20} />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-muted">{label}</p>
                            <h4 className="text-lg font-black">
                                {used} / {limit === Infinity ? <InfinityIcon className="inline-block" size={18} /> : limit}
                            </h4>
                        </div>
                    </div>
                    {limit !== Infinity && (
                        <span className={`text-xs font-bold px-2 py-1 rounded-md ${percentage > 90 ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {Math.round(percentage)}% USED
                        </span>
                    )}
                </div>
                {limit !== Infinity && (
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-1000 ${percentage > 90 ? 'bg-red-500' : 'bg-primary'}`}
                            style={{ width: `${percentage}%` }}
                        />
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background text-white flex font-sans">
            <Sidebar />

            <main className="flex-1 pl-0 lg:pl-72 min-h-screen pt-16 lg:pt-0 transition-all duration-300">
                <div className="max-w-[1200px] mx-auto p-6 lg:p-12">

                    {/* Header */}
                    <header className="mb-12">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest mb-4">
                            <Zap size={12} />
                            Mission Control
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black tracking-tight mb-4">
                            Subscription <span className="text-primary">&</span> Usage
                        </h1>
                        <p className="text-muted text-lg max-w-2xl font-medium">
                            Manage your operative capacity. Monitor your daily resource allocation and upgrade your mission profile.
                        </p>
                    </header>

                    {/* Usage Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                        {loading ? (
                            <>
                                <div className="h-32 glass rounded-3xl animate-pulse" />
                                <div className="h-32 glass rounded-3xl animate-pulse" />
                            </>
                        ) : (
                            <>
                                <UsageBar
                                    label="Intelligence Scrapes"
                                    used={usage?.scrape.used}
                                    limit={usage?.scrape.limit}
                                    icon={Target}
                                />
                                <UsageBar
                                    label="AI Asset Tailoring"
                                    used={usage?.tailor.used}
                                    limit={usage?.tailor.limit}
                                    icon={Star}
                                />
                            </>
                        )}
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Free Plan */}
                        <div className={`glass p-8 rounded-[3rem] border flex flex-col transition-all hover:scale-[1.02] ${usage?.plan === 'free' ? 'border-primary shadow-2xl shadow-primary/10' : 'border-white/5'}`}>
                            <div className="mb-8">
                                <Shield className="text-muted mb-4" size={32} />
                                <h3 className="text-2xl font-black mb-1">Navigator</h3>
                                <p className="text-muted text-sm font-medium">Free Ops Tier</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">$0</span>
                                    <span className="text-muted text-sm font-bold">/MONTH</span>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-sm font-bold">
                                    <Check size={16} className="text-primary" />
                                    <span>5 Scrapes / Day</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm font-bold">
                                    <Check size={16} className="text-primary" />
                                    <span>3 AI Tailors / Day</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm font-bold text-white/30">
                                    <Check size={16} />
                                    <span>Standard AI Assets</span>
                                </li>
                            </ul>
                            <button disabled={usage?.plan === 'free'} className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${usage?.plan === 'free' ? 'bg-primary/20 text-primary' : 'bg-white/5 text-muted hover:bg-white/10'}`}>
                                {usage?.plan === 'free' ? 'Current Profile' : 'Select Plan'}
                            </button>
                        </div>

                        {/* Pro Plan */}
                        <div className={`glass p-8 rounded-[3rem] border relative flex flex-col transition-all hover:scale-[1.02] overflow-hidden ${usage?.plan === 'pro' ? 'border-primary shadow-2xl shadow-primary/10' : 'border-primary/30 shadow-2xl shadow-primary/5'}`}>
                            <div className="absolute top-0 right-0 bg-primary text-white text-[8px] font-black px-4 py-1 rounded-bl-xl uppercase tracking-widest">Recommended</div>
                            <div className="mb-8">
                                <Rocket className="text-primary mb-4" size={32} />
                                <h3 className="text-2xl font-black mb-1">Commander</h3>
                                <p className="font-medium text-primary/80">Full Operational Access</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">$19</span>
                                    <span className="text-muted text-sm font-bold">/MONTH</span>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-sm font-bold">
                                    <Check size={16} className="text-primary" />
                                    <span>Unlimited Scrapes</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm font-bold">
                                    <Check size={16} className="text-primary" />
                                    <span>Unlimited AI Tailors</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm font-bold">
                                    <Check size={16} className="text-primary" />
                                    <span>Priority AI Generation</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm font-bold">
                                    <Check size={16} className="text-primary" />
                                    <span>Advanced Analytics</span>
                                </li>
                            </ul>
                            <button className={`w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-primary/20 ${usage?.plan === 'pro' ? 'bg-primary/20 text-primary pointer-events-none' : 'bg-primary text-white hover:bg-primary/90'}`}>
                                {usage?.plan === 'pro' ? 'Active Mission' : 'Upgrade Now'}
                            </button>
                        </div>

                        {/* Enterprise Plan */}
                        <div className={`glass p-8 rounded-[3rem] border flex flex-col transition-all hover:scale-[1.02] ${usage?.plan === 'enterprise' ? 'border-primary shadow-2xl shadow-primary/10' : 'border-white/5'}`}>
                            <div className="mb-8">
                                <Target className="text-muted mb-4" size={32} />
                                <h3 className="text-2xl font-black mb-1">Enterprise</h3>
                                <p className="text-muted text-sm font-medium">Custom Solutions</p>
                            </div>
                            <div className="mb-8">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-black">Contact</span>
                                </div>
                            </div>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-sm font-bold">
                                    <Check size={16} className="text-primary" />
                                    <span>Team Onboarding</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm font-bold">
                                    <Check size={16} className="text-primary" />
                                    <span>API Access</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm font-bold">
                                    <Check size={16} className="text-primary" />
                                    <span>Dedicated Support</span>
                                </li>
                            </ul>
                            <button className="w-full py-4 rounded-2xl bg-white/5 text-muted hover:bg-white/10 text-xs font-black uppercase tracking-widest transition-all">
                                Protocol Inquiry
                            </button>
                        </div>
                    </div>

                    {/* Safety Notice */}
                    <div className="mt-16 p-8 glass rounded-[2rem] border border-white/5 flex flex-col md:flex-row items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center shrink-0">
                            <Shield className="text-muted" size={32} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black mb-1">Operational Security</h4>
                            <p className="text-sm text-muted font-medium">All billing is handled via encrypted Stripe protocol. Your intelligence data and mission logs remain private and secure.</p>
                        </div>
                        <div className="md:ml-auto">
                            <button className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs hover:text-primary/80 transition-all">
                                View Billing History
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
