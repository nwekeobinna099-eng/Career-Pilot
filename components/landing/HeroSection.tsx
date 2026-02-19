'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowRight, Bot, Star } from 'lucide-react'

export default function HeroSection() {
    return (
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden px-6">
            <div className="max-w-4xl mx-auto text-center relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-white/60 text-xs font-bold uppercase tracking-widest mb-8 hover:bg-white/10 transition-colors cursor-default">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live: v2.5
                </div>

                <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-[0.9] text-white">
                    Your Career.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-b from-primary to-purple-600">
                        Autopilot.
                    </span>
                </h1>

                <p className="text-xl md:text-2xl text-muted font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
                    The AI agent that scans job boards, tailors your CV, and applies for you. Stop searching. Start interviewing.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link href="/signup" className="w-full sm:w-auto px-8 py-4 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all">
                        Start Free Trial <ArrowRight size={20} />
                    </Link>
                    <Link href="#how-it-works" className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all">
                        See Demo
                    </Link>
                </div>

                <div className="mt-12 flex items-center justify-center gap-8 text-muted/60">
                    <div className="flex items-center gap-2">
                        <Bot size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">AI-Powered</span>
                    </div>
                    <div className="w-1 h-1 bg-white/10 rounded-full" />
                    <div className="flex items-center gap-2">
                        <Star size={16} />
                        <span className="text-xs font-bold uppercase tracking-widest">4.9/5 Rating</span>
                    </div>
                </div>
            </div>
        </section>
    )
}
