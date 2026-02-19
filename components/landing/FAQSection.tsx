'use client'

import React from 'react'
import { ChevronRight } from 'lucide-react'

export default function FAQSection() {
    return (
        <section id="faq" className="max-w-4xl mx-auto px-6 py-24 border-t border-white/5">
            <div className="text-center mb-16">
                <h2 className="text-4xl md:text-6xl font-black mb-4 uppercase tracking-tight">Questions? Answered.</h2>
                <p className="text-muted text-lg font-medium">Everything you need to know about CareerPilot.</p>
            </div>

            <div className="space-y-4">
                {[
                    { q: 'How does CareerPilot find jobs?', a: 'CareerPilot scans Indeed and LinkedIn in real-time using intelligent automation. You enter your desired role and location, and we return curated listings with full job descriptions — no manual browsing required.' },
                    { q: 'Will my tailored CV pass ATS systems?', a: 'Yes. Our AI analyzes the job description and optimizes your CV with the right keywords, formatting, and structure to achieve a 98% ATS pass rate. The output is a clean, professional document that both machines and humans love.' },
                    { q: 'Is my data secure?', a: 'Absolutely. We use Supabase with row-level security (RLS), meaning your data is only accessible to you. All API endpoints are authenticated and rate-limited. We never share your personal information.' },
                    { q: 'Can I use CareerPilot for free?', a: 'Yes! The Navigator plan gives you 5 daily scans and 3 AI-tailored applications for free. Upgrade to Commander for unlimited access and premium features like interview prep.' },
                    { q: 'What AI model powers the tailoring?', a: 'We use Google Gemini 2.5 Flash for ultra-fast, high-quality document generation. The model analyzes both your profile and the job description to produce uniquely tailored CVs and cover letters.' },
                    { q: 'How is this different from ChatGPT?', a: 'ChatGPT requires you to manually copy job descriptions, paste your CV, and engineer prompts. CareerPilot automates the entire pipeline: scraping → profile matching → document generation → PDF export → application tracking — all in one click.' },
                ].map((faq, i) => (
                    <details key={i} className="glass rounded-2xl border border-white/5 group open:bg-white/5 transition-colors">
                        <summary className="px-8 py-6 cursor-pointer flex items-center justify-between font-black text-white hover:text-primary transition-colors list-none">
                            <span>{faq.q}</span>
                            <ChevronRight size={18} className="text-muted group-open:rotate-90 transition-transform" />
                        </summary>
                        <div className="px-8 pb-6 text-muted font-medium leading-relaxed">
                            {faq.a}
                        </div>
                    </details>
                ))}
            </div>
        </section>
    )
}
