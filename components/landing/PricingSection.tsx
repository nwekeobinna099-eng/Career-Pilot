'use client'

import React from 'react'
import { CheckCircle2 } from 'lucide-react'
import CheckoutButton from '@/components/CheckoutButton'
import Link from 'next/link'

export default function PricingSection() {
    return (
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 blur-[128px] rounded-full pointer-events-none" />

            <div className="text-center mb-16 relative z-10">
                <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight">Fair Pricing</h2>
                <p className="text-muted text-lg font-medium">Invest in your career for less than the cost of a coffee.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {/* Free Tier */}
                <div className="glass p-10 rounded-[2.5rem] border border-white/5 flex flex-col hover:bg-white/5 transition-colors h-full">
                    <div className="mb-8">
                        <h3 className="text-lg font-black uppercase tracking-tight text-white mb-2">Navigator</h3>
                        <div className="text-5xl font-black text-white">$0<span className="text-lg text-muted font-bold">/mo</span></div>
                        <p className="text-muted text-sm font-medium mt-2">Perfect for casual browsing</p>
                    </div>
                    <div className="space-y-4 flex-1 mb-10">
                        {['5 Job Scans per day', '3 Tailored Applications/day', 'Basic Analytics', 'Standard Support'].map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 size={16} className="text-white/20 flex-shrink-0" />
                                <span className="text-sm font-medium text-white/50">{f}</span>
                            </div>
                        ))}
                    </div>
                    <Link href="/signup" className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-center transition-all cursor-pointer">
                        Start for Free
                    </Link>
                </div>

                {/* Pro Tier */}
                <div className="glass p-10 rounded-[2.5rem] border-2 border-primary/40 flex flex-col relative glow-primary transform md:-translate-y-4 h-full bg-white/5">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-primary rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-primary/20">
                        Most Popular
                    </div>
                    <div className="mb-8">
                        <h3 className="text-lg font-black uppercase tracking-tight text-primary mb-2">Commander</h3>
                        <div className="text-5xl font-black text-white">$19<span className="text-lg text-muted font-bold">/mo</span></div>
                        <p className="text-muted text-sm font-medium mt-2">For serious job seekers</p>
                    </div>
                    <div className="space-y-4 flex-1 mb-10">
                        {['Unlimited Job Scans', 'Unlimited Tailoring', 'Advanced Analytics', 'Priority Support', 'Interview Prep AI', 'PDF Exports'].map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 size={16} className="text-primary flex-shrink-0" />
                                <span className="text-sm font-medium text-white/80">{f}</span>
                            </div>
                        ))}
                    </div>
                    <CheckoutButton />
                </div>

                {/* Enterprise Tier */}
                <div className="glass p-10 rounded-[2.5rem] border border-white/5 flex flex-col hover:bg-white/5 transition-colors h-full">
                    <div className="mb-8">
                        <h3 className="text-lg font-black uppercase tracking-tight text-accent mb-2">Enterprise</h3>
                        <div className="text-5xl font-black text-white">Custom</div>
                        <p className="text-muted text-sm font-medium mt-2">For teams & agencies</p>
                    </div>
                    <div className="space-y-4 flex-1 mb-10">
                        {['Everything in Commander', 'Team Management', 'API Access', 'Dedicated Account Manager', 'Custom Integrations', 'SLA Support'].map((f, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <CheckCircle2 size={16} className="text-accent flex-shrink-0" />
                                <span className="text-sm font-medium text-white/50">{f}</span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-center transition-all cursor-pointer">
                        Contact Sales
                    </button>
                </div>
            </div>
        </section>
    )
}
