'use client'

import React from 'react'
import { Github, Twitter, Linkedin } from 'lucide-react'

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black/20 py-20">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
                <div className="col-span-1 md:col-span-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center">
                            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-black uppercase text-white">CareerPilot</span>
                    </div>
                    <p className="text-muted font-medium max-w-sm">
                        The advanced AI platform for automating your job search.
                        Scan, tailor, and apply with precision.
                    </p>
                </div>

                <div>
                    <h4 className="font-black text-white uppercase tracking-widest mb-6 text-sm">Platform</h4>
                    <ul className="space-y-4 text-muted font-medium text-sm">
                        <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Enterprise</a></li>
                        <li><a href="#" className="hover:text-primary transition-colors">Changelog</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-black text-white uppercase tracking-widest mb-6 text-sm">Connect</h4>
                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted hover:bg-white/10 hover:text-white transition-all">
                            <Github size={20} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted hover:bg-white/10 hover:text-white transition-all">
                            <Twitter size={20} />
                        </a>
                        <a href="#" className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted hover:bg-white/10 hover:text-white transition-all">
                            <Linkedin size={20} />
                        </a>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs font-medium text-muted/50 uppercase tracking-widest">
                <p>© 2026 CareerPilot Inc. All systems normal.</p>
                <div className="flex gap-8 mt-4 md:mt-0">
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                </div>
            </div>
        </footer>
    )
}
