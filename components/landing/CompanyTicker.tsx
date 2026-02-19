'use client'

import React from 'react'

const COMPANIES = ['Google', 'Microsoft', 'Meta', 'Amazon', 'Stripe', 'DeepMind', 'Figma', 'Shopify']

export default function CompanyTicker() {
    return (
        <div className="py-12 border-y border-white/5 bg-white/[0.02]">
            <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Trusted by professionals at</p>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-8 opacity-50">
                    {COMPANIES.map((company, i) => (
                        <span key={i} className="text-xl md:text-2xl font-black text-white/40 uppercase tracking-tighter cursor-default">
                            {company}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    )
}
