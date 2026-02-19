'use client'

import React, { useState } from 'react'
import { X, Target, ShieldCheck, Zap, Download, Loader2, Sparkles, Brain, Briefcase } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface BehavioralQuestion {
    question: string
    strategy: string
    starAnswer: string
}

interface TechnicalDrill {
    question: string
    answer: string
}

interface CompanyInsight {
    title: string
    insight: string
}

interface InterviewPrepContent {
    intro: string
    behavioralQuestions: BehavioralQuestion[]
    technicalDrills: TechnicalDrill[]
    companyIntelligence: CompanyInsight[]
    questionsForInterviewer: { question: string; context: string }[]
}

interface InterviewPrepModalProps {
    isOpen: boolean
    onClose: () => void
    jobTitle: string
    company: string
    content: InterviewPrepContent
}

export default function InterviewPrepModal({ isOpen, onClose, jobTitle, company, content }: InterviewPrepModalProps) {
    const [exporting, setExporting] = useState(false)

    if (!isOpen) return null

    const handleExportPDF = async () => {
        setExporting(true)
        const element = document.getElementById('prep-kit-content')
        if (!element) return

        try {
            await document.fonts.ready

            // Use a higher scale for better resolution
            const canvas = await html2canvas(element, {
                scale: 1.5,
                useCORS: true,
                backgroundColor: '#0f172a',
                logging: false,
                windowWidth: element.scrollWidth,
                onclone: (clonedDoc) => {
                    // SANITIZATION: html2canvas fails on oklab/oklch (common in Tailwind 4)
                    // 1. Wipe all 'okl' references from all style tags
                    const styleTags = clonedDoc.getElementsByTagName('style');
                    for (let i = 0; i < styleTags.length; i++) {
                        styleTags[i].innerHTML = styleTags[i].innerHTML.replace(/okl[a-z]+\([^)]+\)/g, '#111');
                    }

                    // 2. Iterate ALL elements and sanitize all known color properties
                    const allNodes = clonedDoc.querySelectorAll('*');
                    allNodes.forEach((node: any) => {
                        if (node instanceof HTMLElement) {
                            // Fix common properties directly
                            const s = window.getComputedStyle(node);
                            const props = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke', 'outlineColor'];

                            props.forEach(p => {
                                const val = (s as any)[p];
                                if (val && val.includes('okl')) {
                                    (node.style as any)[p] = '#ffffff'; // Fallback
                                }
                            });

                            // Box shadow is a major culprit
                            if (s.boxShadow.includes('okl')) {
                                node.style.boxShadow = 'none';
                            }
                        }
                    });

                    // 3. Special handling for the target container
                    const clonedElement = clonedDoc.getElementById('prep-kit-content');
                    if (clonedElement) {
                        clonedElement.style.overflow = 'visible';
                        clonedElement.style.height = 'auto';
                        clonedElement.style.backgroundColor = '#0f172a';
                    }
                }
            })

            const imgData = canvas.toDataURL('image/jpeg', 0.9)
            const pdf = new jsPDF('p', 'mm', 'a4')
            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pdfHeight = pdf.internal.pageSize.getHeight()
            const canvasWidth = canvas.width
            const canvasHeight = canvas.height

            const imgHeight = (canvasHeight * pdfWidth) / canvasWidth
            let heightLeft = imgHeight
            let position = 0

            // Add first page
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight)
            heightLeft -= pdfHeight

            // Add extra pages if content overflows
            while (heightLeft > 0) {
                position = heightLeft - imgHeight
                pdf.addPage()
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight)
                heightLeft -= pdfHeight
            }

            pdf.save(`Interview_Prep_${jobTitle.replace(/\s+/g, '_')}_${company.replace(/\s+/g, '_')}.pdf`)
        } catch (error) {
            console.error('PDF Export Error:', error)
            alert('Mission failed: Could not export PDF. Please ensure the content is fully loaded.')
        } finally {
            setExporting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" onClick={onClose} />

            <div className="relative w-full max-w-5xl max-h-[90vh] glass rounded-[3rem] border border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
                {/* Header */}
                <header className="px-10 py-8 border-b border-white/10 flex justify-between items-center bg-white/5 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/20">
                            <Brain size={28} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">AI Interview Prep Kit</h2>
                            <p className="text-muted text-xs font-bold uppercase tracking-widest">{jobTitle} @ {company}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleExportPDF}
                            disabled={exporting}
                            className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all text-white disabled:opacity-50"
                        >
                            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                            {exporting ? 'Targeting PDF...' : 'Export Kit'}
                        </button>
                        <button onClick={onClose} className="p-3 hover:bg-white/10 rounded-xl transition-colors text-muted hover:text-white">
                            <X size={24} />
                        </button>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar" id="prep-kit-content">
                    {/* Intro Briefing */}
                    <section className="mb-12 p-8 glass rounded-3xl border border-primary/20 bg-primary/5 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10">
                            <h3 className="flex items-center gap-3 text-lg font-black text-primary mb-4 uppercase tracking-tighter">
                                <ShieldCheck size={20} /> Mission Briefing
                            </h3>
                            <p className="text-white/90 text-lg font-medium leading-relaxed italic">
                                "{content.intro}"
                            </p>
                        </div>
                    </section>

                    {/* Behavioral Questions */}
                    <section className="mb-16">
                        <h3 className="flex items-center gap-3 text-2xl font-black text-white mb-8 uppercase tracking-tight">
                            <Target size={24} className="text-accent" /> Behavioral Drill
                        </h3>
                        <div className="space-y-8">
                            {content.behavioralQuestions.map((q, i) => (
                                <div key={i} className="glass p-8 rounded-[2rem] border border-white/5 group hover:border-white/20 transition-all">
                                    <div className="flex gap-6">
                                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-accent font-black shrink-0">
                                            {i + 1}
                                        </div>
                                        <div className="space-y-6 flex-1">
                                            <div>
                                                <h4 className="text-xl font-bold text-white mb-2">{q.question}</h4>
                                                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                                    <p className="text-xs font-black uppercase tracking-widest text-muted mb-2">Coach's Strategy:</p>
                                                    <p className="text-sm text-white/70 font-medium italic">{q.strategy}</p>
                                                </div>
                                            </div>
                                            <div className="p-6 bg-accent/10 rounded-2xl border border-accent/20">
                                                <p className="text-xs font-black uppercase tracking-widest text-accent mb-4 flex items-center gap-2">
                                                    <Sparkles size={14} /> Recommended STAR Response
                                                </p>
                                                <div className="text-white/90 font-medium leading-relaxed prose prose-invert max-w-none">
                                                    <ReactMarkdown rehypePlugins={[rehypeSanitize]}>{q.starAnswer}</ReactMarkdown>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Technical Drills */}
                    <section className="mb-16">
                        <h3 className="flex items-center gap-3 text-2xl font-black text-white mb-8 uppercase tracking-tight">
                            <Zap size={24} className="text-primary" /> Technical Deep Dive
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {content.technicalDrills.map((q, i) => (
                                <div key={i} className="glass p-8 rounded-3xl border border-white/5 flex flex-col justify-between">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-4">Drill 0{i + 1}</p>
                                        <h4 className="text-lg font-bold text-white mb-6">{q.question}</h4>
                                    </div>
                                    <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                                        <p className="text-sm text-white/80 font-medium">{q.answer}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Company Insights & Questions */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Company Intel */}
                        <div className="glass p-8 rounded-[2.5rem] border border-white/5">
                            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight border-b border-white/5 pb-4">Company Intelligence</h3>
                            <div className="space-y-6">
                                {content.companyIntelligence.map((intel, i) => (
                                    <div key={i} className="space-y-2">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                            <Briefcase size={12} /> {intel.title}
                                        </h4>
                                        <p className="text-sm text-muted leading-relaxed font-medium">{intel.insight}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Questions for Interviewer */}
                        <div className="glass p-8 rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-green-500/5 to-transparent">
                            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight border-b border-white/5 pb-4">Strategic Questions to Ask</h3>
                            <div className="space-y-6">
                                {content.questionsForInterviewer.map((q, i) => (
                                    <div key={i} className="space-y-2">
                                        <h4 className="text-sm font-bold text-white italic">"{q.question}"</h4>
                                        <p className="text-[10px] uppercase font-black tracking-widest text-green-500/80">Context: {q.context}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer HUD */}
                <footer className="px-10 py-6 border-t border-white/10 bg-white/5 flex items-center justify-between shrink-0">
                    <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">AI Interview Performance System v2.0</p>
                    <div className="flex items-center gap-2 text-green-500 font-black text-[10px] uppercase tracking-widest">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        Mission Ready
                    </div>
                </footer>
            </div>
        </div>
    )
}
