'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
    return (
        <nav className="fixed top-6 inset-x-0 mx-auto w-[calc(100%-3rem)] max-w-5xl z-50">
            <div className="glass px-6 py-4 rounded-3xl grid grid-cols-2 md:grid-cols-3 items-center border border-white/10 backdrop-blur-xl bg-black/20">
                <div className="flex items-center gap-3 justify-self-start">
                    <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center shadow-lg shadow-primary/20 bg-white/5 relative">
                        <Image src="/logo.png" alt="CareerPilot Logo" fill className="object-cover" />
                    </div>
                    <div className="text-xl font-black tracking-tighter bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent uppercase cursor-default hidden sm:block">
                        CareerPilot
                    </div>
                </div>

                <div className="hidden md:flex items-center justify-center gap-8 justify-self-center">
                    {['Features', 'How It Works', 'Pricing', 'FAQ'].map((item) => (
                        <a
                            key={item}
                            href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-sm font-bold text-muted hover:text-white transition-colors relative group whitespace-nowrap"
                        >
                            {item}
                        </a>
                    ))}
                </div>

                <div className="flex items-center gap-4 justify-self-end">
                    <Link href="/login" className="text-sm font-black text-muted hover:text-primary uppercase tracking-widest transition-colors cursor-pointer whitespace-nowrap">Log In</Link>
                    <Link href="/signup" className="hidden sm:flex px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-sm font-black uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-primary/10 whitespace-nowrap">
                        Get Started
                    </Link>
                </div>
            </div>
        </nav>
    )
}
