import Link from 'next/link'
import { Briefcase, Wand2, ShieldCheck, Zap, ArrowRight, Github, Star, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 overflow-x-hidden">
      {/* Dynamic Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 bg-[#0f172a]">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-primary/10 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-accent/5 blur-[150px] rounded-full animate-pulse delay-1000" />
      </div>

      {/* Floating Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-5xl z-50">
        <div className="glass px-6 py-4 rounded-3xl flex justify-between items-center glow-primary">
          <div className="text-xl font-black tracking-tighter bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent uppercase">
            CareerPilot
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-sm font-semibold text-muted hover:text-primary transition-colors cursor-pointer">Dashboard</Link>
            <Link href="/profile" className="px-5 py-2.5 bg-primary hover:bg-primary/90 rounded-2xl text-sm font-bold transition-all shadow-lg shadow-primary/20 cursor-pointer">
              Setup Profile
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-48 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest mb-10 glow-primary">
            <Zap size={14} className="fill-primary" /> The Future of Job Hunting
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Apply to jobs<br />
            <span className="text-primary italic">supernaturally</span> fast.
          </h1>
          <p className="text-xl md:text-2xl text-muted max-w-2xl mx-auto font-medium leading-relaxed mb-12">
            CareerPilot automates the high-friction parts of your search. Scrape major platforms, tailor applications with AI, and track your ascent.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/dashboard" className="w-full sm:w-auto px-10 py-5 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary/40 transition-all transform hover:scale-105 cursor-pointer">
              Launch CareerPilot <ArrowRight size={22} />
            </Link>
            <div className="flex items-center gap-4 text-sm font-bold text-muted bg-white/5 px-6 py-4 rounded-2xl border border-white/5">
              <div className="flex -space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#0f172a] bg-slate-800 flex items-center justify-center text-[10px]">AI</div>
                ))}
              </div>
              <span>Trusted by 5,000+ candidates</span>
            </div>
          </div>
        </div>
      </section>

      {/* Bento-ish Feature Grid */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[240px]">
          {/* Main Scraper Card */}
          <div className="md:col-span-8 md:row-span-2 glass p-10 rounded-[2.5rem] flex flex-col justify-end group glass-hover cursor-pointer relative overflow-hidden">
            <div className="absolute top-10 right-10 opacity-10 group-hover:opacity-20 transition-opacity">
              <Briefcase size={200} />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-primary/20 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <Briefcase size={32} />
              </div>
              <h3 className="text-4xl font-black mb-4 uppercase">Automated Intelligence</h3>
              <p className="text-muted text-xl max-w-md font-medium">Scrape LinkedIn, Indeed, and Glassdoor in one unified interface. No more manual browsing.</p>
            </div>
          </div>

          {/* AI Tailoring Card */}
          <div className="md:col-span-4 md:row-span-1 glass p-8 rounded-[2rem] flex flex-col justify-between group glass-hover cursor-pointer">
            <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center text-accent">
              <Wand2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black mb-2 uppercase">AI Precision</h3>
              <p className="text-muted text-sm font-medium">Tailor every document for ATS perfection.</p>
            </div>
          </div>

          {/* Tracking Card */}
          <div className="md:col-span-4 md:row-span-1 glass p-8 rounded-[2rem] flex flex-col justify-between group glass-hover cursor-pointer border-accent/20">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <h3 className="text-xl font-black mb-2 uppercase">Application HUD</h3>
              <p className="text-muted text-sm font-medium">Monitor every stage of your career journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="bg-white/5 py-24 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-5xl font-black text-primary mb-2">98%</div>
              <div className="text-muted text-xs font-bold uppercase tracking-widest">ATS Pass Rate</div>
            </div>
            <div>
              <div className="text-5xl font-black text-accent mb-2">12M+</div>
              <div className="text-muted text-xs font-bold uppercase tracking-widest">Jobs Scraped</div>
            </div>
            <div>
              <div className="text-5xl font-black text-green-500 mb-2">4.9/5</div>
              <div className="text-muted text-xs font-bold uppercase tracking-widest">User Rating</div>
            </div>
            <div>
              <div className="text-5xl font-black text-purple-400 mb-2">0.5s</div>
              <div className="text-muted text-xs font-bold uppercase tracking-widest">Tailoring Speed</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="text-2xl font-black tracking-tighter text-white/10 uppercase mb-8">CareerPilot</div>
        <div className="flex justify-center gap-8 mb-8 text-muted font-bold text-sm">
          <Link href="#" className="hover:text-primary transition-colors">Documentation</Link>
          <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-primary transition-colors">Open Source</Link>
        </div>
        <div className="flex justify-center gap-6 opacity-30">
          <a href="#" className="hover:text-white transition-colors cursor-pointer"><Github size={24} /></a>
        </div>
        <p className="mt-12 text-xs font-bold text-white/5 uppercase tracking-[0.3em]">Built for the High-Frequency Candidate</p>
      </footer>
    </div>
  )
}
