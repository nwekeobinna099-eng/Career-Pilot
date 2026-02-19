'use client'

import React from 'react'
import { MessageSquare, Star } from 'lucide-react'

export default function TestimonialsSection() {
    return (
        <section className="max-w-7xl mx-auto px-6 py-24 border-t border-white/5">
            <div className="text-center mb-16">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest mb-6">
                    <MessageSquare size={14} /> What Users Say
                </div>
                <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight">Loved by Professionals</h2>
                <p className="text-muted text-lg font-medium">Join thousands of successful candidates worldwide.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { name: 'Sarah J.', role: 'Senior Dev at TechFlow', text: "CareerPilot saved me 10 hours a week in application prep. The AI-tailored CVs got me 3 interviews in my first week.", avatar: 'SJ' },
                    { name: 'Michael R.', role: 'Product Manager at Stripe', text: "The job scanner is a game changer. I find high-quality leads that I used to miss manually. Worth every penny.", avatar: 'MR' },
                    { name: 'Elena D.', role: 'Data Scientist at DeepMind', text: "The formatting is incredible. Every CV looks like it was designed by a professional. My response rate went from 5% to 35% overnight.", avatar: 'ED' },
                    { name: 'James K.', role: 'DevOps Engineer', text: "I was skeptical about AI-generated cover letters, but they actually sound like me. The tone matching is incredibly accurate.", avatar: 'JK' },
                    { name: 'Priya S.', role: 'UX Designer at Figma', text: "The STAR response generator for interviews is phenomenal. I walked into my panel interview feeling more prepared than ever.", avatar: 'PS' },
                    { name: 'Alex T.', role: 'Full-Stack Developer', text: "Applied to 40 roles in one weekend. Without CareerPilot, that would have taken me a month.", avatar: 'AT' },
                ].map((t, i) => (
                    <div key={i} className="p-8 glass rounded-[2rem] border border-white/5 relative group hover:bg-white/5 transition-colors">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center text-primary font-black text-sm">
                                {t.avatar}
                            </div>
                            <div>
                                <div className="font-black text-white uppercase tracking-tight">{t.name}</div>
                                <div className="text-muted text-[10px] font-bold uppercase tracking-widest">{t.role}</div>
                            </div>
                        </div>
                        <div className="flex gap-1 mb-4 text-amber-400">
                            {[1, 2, 3, 4, 5].map(s => <Star key={s} size={14} fill="currentColor" />)}
                        </div>
                        <p className="text-muted italic font-medium leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                    </div>
                ))}
            </div>
        </section>
    )
}
