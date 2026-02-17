'use client'

import React from 'react'
import { ExternalLink, Wand2, CheckCircle2, Circle, Clock } from 'lucide-react'

interface JobCardProps {
    job: {
        id: string
        title: string
        company: string
        platform: string
        url: string
        scraped_at: string
    }
    status: 'new' | 'tailoring' | 'tailored' | 'applied'
    onTailor: (id: string) => void
}

export default function JobCard({ job, status, onTailor }: JobCardProps) {
    const getStatusIcon = () => {
        switch (status) {
            case 'tailored': return <CheckCircle2 className="text-green-400" size={18} />
            case 'applied': return <CheckCircle2 className="text-blue-400" size={18} />
            case 'tailoring': return <Clock className="text-yellow-400 animate-pulse" size={18} />
            default: return <Circle className="text-white/20" size={18} />
        }
    }

    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all group">
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                        {job.title}
                    </h3>
                    <p className="text-white/60 font-medium">{job.company}</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
                    {getStatusIcon()}
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">{status}</span>
                </div>
            </div>

            <div className="flex items-center gap-4 mt-6">
                <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold transition-all"
                >
                    View Job <ExternalLink size={14} />
                </a>
                <button
                    onClick={() => onTailor(job.id)}
                    disabled={status === 'tailoring' || status === 'tailored' || status === 'applied'}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all
            ${status === 'tailored' || status === 'applied'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20'}
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
                >
                    {status === 'tailored' || status === 'applied' ? 'Tailored' : (
                        <>Tailor with AI <Wand2 size={14} /></>
                    )}
                </button>
            </div>

            <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-white/30 uppercase tracking-widest font-bold">
                <span>Platform: {job.platform}</span>
                <span>Scraped {new Date(job.scraped_at).toLocaleDateString()}</span>
            </div>
        </div>
    )
}
