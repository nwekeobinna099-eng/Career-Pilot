'use client'

import React from 'react'
import Link from 'next/link'
import { Rocket, ArrowRight } from 'lucide-react'

export default function CTASection() {
    return (
        <section className="py-32 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none" />

            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-8 glow-primary">
                    <Rocket size={14} /> Ready for Takeoff?
                </div>
                <h2 className="text-4xl md:text-7xl font-black mb-6 uppercase tracking-tight bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
                    Your Dream Job Is<br />One Click Away
                </h2>
                <p className="text-xl text-muted font-medium max-w-2xl mx-auto mb-10">
                    Join thousands of professionals who automated their job search to land roles at top companies.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/signup" className="px-10 py-5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 transition-all cursor-pointer">
                        Start Free Trial <ArrowRight size={22} />
                    </Link>
                </div>
                <p className="text-muted/40 text-sm font-medium mt-6">Free forever on the Navigator plan · No credit card required</p>
            </div>
        </section>
    )
}
