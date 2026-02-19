'use client'

import React from 'react'
import { ExternalLink, Wand2, CheckCircle2, Clock, Building2, MapPin } from 'lucide-react'

interface JobCardProps {
    job: {
        id: string
        title: string
        company: string
        platform: string
        url: string
        location?: string
        scraped_at: string
    }
    status: 'new' | 'tailored' | 'applied'
    onTailor: (id: string) => void
    isTailoring?: boolean
}

const JobCard: React.FC<JobCardProps> = ({ job, status, onTailor, isTailoring }) => {
    const statusStyles = {
        new: {
            label: 'New Listing',
            icon: <Clock size={12} />,
            color: 'text-primary bg-primary/10 border-primary/20',
        },
        tailored: {
            label: 'AI Tailored',
            icon: <Wand2 size={12} />,
            color: 'text-accent bg-accent/10 border-accent/20',
        },
        applied: {
            label: 'Applied',
            icon: <CheckCircle2 size={12} />,
            color: 'text-green-400 bg-green-500/10 border-green-500/20',
        },
    }

    const currentStatus = statusStyles[status]

    return (
        <div className="glass p-6 rounded-[2rem] flex flex-col h-full border border-white/5 transition-all group glass-hover hover:scale-[1.02] cursor-pointer glow-primary">
            <div className="flex justify-between items-start mb-6">
                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${currentStatus.color}`}>
                    {currentStatus.icon}
                    {currentStatus.label}
                </div>
                <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-muted hover:text-white transition-all transition-transform hover:rotate-12"
                >
                    <ExternalLink size={18} />
                </a>
            </div>

            <div className="mb-auto">
                <h3 className="text-xl font-black mb-3 leading-tight group-hover:text-primary transition-colors">
                    {job.title}
                </h3>

                <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-muted">
                        <Building2 size={14} className="text-primary/60" />
                        <span className="truncate">{job.company}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-bold text-muted">
                        <MapPin size={14} className="text-accent/60" />
                        <span>{job.location || 'Remote'}</span>
                    </div>
                </div>
            </div>

            <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="text-[10px] font-black text-white/20 uppercase tracking-tighter">
                    Via {job.platform}
                </div>

                {status !== 'applied' && (
                    <button
                        onClick={() => onTailor(job.id)}
                        disabled={isTailoring}
                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-primary hover:text-white rounded-xl text-xs font-black transition-all cursor-pointer group/btn disabled:opacity-50"
                    >
                        {isTailoring ? (
                            <Clock size={14} className="animate-spin" />
                        ) : (
                            <Wand2 size={14} className="group-hover/btn:animate-pulse" />
                        )}
                        {isTailoring ? 'TAILORING...' : 'Tailor with AI'}
                    </button>
                )}
            </div>
        </div>
    )
}

export default JobCard
