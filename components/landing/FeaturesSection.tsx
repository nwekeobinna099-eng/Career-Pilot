'use client'

import React from 'react'
import { Search, Wand2, CheckCircle2 } from 'lucide-react'

export default function FeaturesSection() {
    return (
        <section id="how-it-works" className="max-w-7xl mx-auto px-6 py-24">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight">Three Steps. Zero Stress.</h2>
                <p className="text-muted text-lg font-medium">From job hunt to interview in minutes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                    { step: '01', title: 'Scan', desc: 'Enter your dream role and location. Our engine scans LinkedIn and Indeed in seconds, returning curated listings with full descriptions.', icon: <Search size={24} /> },
                    { step: '02', title: 'Tailor', desc: 'One click. AI analyzes the job description against your profile and generates a unique CV and cover letter optimized for ATS systems.', icon: <Wand2 size={24} /> },
                    { step: '03', title: 'Land', desc: 'Download polished PDFs, track your applications in real-time, and ace interviews with AI-generated prep kits.', icon: <CheckCircle2 size={24} /> },
                ].map((item, i) => (
                    <div key={i} className="relative p-8 glass rounded-[2rem] border border-white/5 group hover:border-primary/30 transition-all">
                        <div className="text-7xl font-black text-white/5 absolute top-4 right-8 group-hover:text-primary/10 transition-colors">{item.step}</div>
                        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 text-primary">
                            {item.icon}
                        </div>
                        <h4 className="text-2xl font-black mb-3 uppercase tracking-tight">{item.title}</h4>
                        <p className="text-muted font-medium leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
