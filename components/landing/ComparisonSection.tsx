'use client'

import React from 'react'
import { CheckCircle2, X } from 'lucide-react'

export default function ComparisonSection() {
    return (
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5 overflow-hidden">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight">Manual vs. CareerPilot</h2>
                <p className="text-muted text-lg font-medium">See the difference automation makes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* Without */}
                <div className="glass p-10 rounded-[2.5rem] border border-red-500/20 relative overflow-hidden">
                    <div className="absolute top-6 right-8 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 bg-red-500/10 px-4 py-1.5 rounded-full border border-red-500/20">Old Way</div>
                    <h3 className="text-2xl font-black mb-8 text-red-400 uppercase">Without CareerPilot</h3>
                    <div className="space-y-5">
                        {[
                            'Browse 5+ job boards manually every day',
                            'Copy-paste the same CV for every application',
                            'Hope your resume passes ATS screening',
                            'Spend 2+ hours per customized application',
                            'No idea which applications are progressing',
                            'Wing the interview with generic prep',
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 text-muted">
                                <div className="w-5 h-5 mt-0.5 bg-red-500/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <X size={12} className="text-red-400" />
                                </div>
                                <span className="font-medium text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* With */}
                <div className="glass p-10 rounded-[2.5rem] border border-green-500/20 relative overflow-hidden">
                    <div className="absolute top-6 right-8 text-[10px] font-black uppercase tracking-[0.2em] text-green-400 bg-green-500/10 px-4 py-1.5 rounded-full border border-green-500/20">New Way</div>
                    <h3 className="text-2xl font-black mb-8 text-green-400 uppercase">With CareerPilot</h3>
                    <div className="space-y-5">
                        {[
                            'Scan all major boards in one click',
                            'AI-tailored CV + cover letter per application',
                            '98% ATS pass rate with optimized formatting',
                            'Go from job listing to tailored app in 30 seconds',
                            'Track every application in your command center',
                            'AI interview prep with STAR responses & drills',
                        ].map((item, i) => (
                            <div key={i} className="flex items-start gap-3 text-white/90">
                                <div className="w-5 h-5 mt-0.5 bg-green-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    <CheckCircle2 size={12} className="text-green-400" />
                                </div>
                                <span className="font-medium text-sm">{item}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
