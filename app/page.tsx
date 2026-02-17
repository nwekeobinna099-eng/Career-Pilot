import Link from 'next/link'
import { Briefcase, Wand2, ShieldCheck, Zap, ArrowRight, Github } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white selection:bg-blue-500/30 overflow-x-hidden">
      {/* Background Orbs */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 blur-[120px] rounded-full animate-pulse delay-700" />
      </div>

      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 py-8 flex justify-between items-center relative z-10">
        <div className="text-2xl font-black tracking-tighter bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
          CAREERPILOT
        </div>
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="text-sm font-bold hover:text-blue-400 transition-colors">Dashboard</Link>
          <Link href="/profile" className="px-5 py-2.5 bg-white/10 hover:bg-white/20 rounded-full border border-white/10 text-sm font-bold transition-all">
            Universal Profile
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-32 relative z-10">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-widest mb-8">
            <Zap size={14} /> AI-Powered Job Search
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8">
            Apply to jobs <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent italic">supernaturally</span> fast.
          </h1>
          <p className="text-xl md:text-2xl text-white/40 max-w-2xl font-medium leading-relaxed mb-12">
            CareerPilot automates the boring parts of job hunting. Scrape major platforms, tailor documents with AI, and track everything in one premium dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/dashboard" className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 shadow-2xl shadow-blue-500/40 transition-all transform hover:scale-105">
              Launch Dashboard <ArrowRight size={20} />
            </Link>
            <Link href="/profile" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-2xl font-black text-lg flex items-center justify-center gap-2 transition-all">
              Setup Your Profile
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          {
            icon: <Briefcase className="text-blue-400" size={32} />,
            title: "Automated Scraping",
            desc: "Indeed, LinkedIn, Glassdoor. One click to gather all the best opportunities in your area."
          },
          {
            icon: <Wand2 className="text-purple-400" size={32} />,
            title: "AI Document Tailoring",
            desc: "Custom CVs and Cover Letters for every application, optimized for ATS and human eyes."
          },
          {
            icon: <ShieldCheck className="text-green-400" size={32} />,
            title: "Application Tracking",
            desc: "Never lose track of where you applied. A clean dashboard to monitor your career progress."
          }
        ].map((f, i) => (
          <div key={i} className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:border-white/20 transition-all group">
            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">{f.icon}</div>
            <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">{f.title}</h3>
            <p className="text-white/40 leading-relaxed font-medium">{f.desc}</p>
          </div>
        ))}
      </section>

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 text-center">
        <div className="text-sm font-bold text-white/20 uppercase tracking-[0.2em] mb-4">Built with CareerPilot Engine</div>
        <div className="flex justify-center gap-6">
          <a href="#" className="text-white/40 hover:text-white transition-colors"><Github size={20} /></a>
        </div>
      </footer>
    </div>
  )
}
