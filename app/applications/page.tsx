'use client'

import React, { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Briefcase, Zap, FileText, X, Download, Eye, ExternalLink, Loader2, Trash2 } from 'lucide-react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import rehypeSanitize from 'rehype-sanitize'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import Sidebar from '@/components/Sidebar'
import InterviewPrepModal from '@/components/InterviewPrepModal'

export default function ApplicationsPage() {
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [selectedApp, setSelectedApp] = useState<any>(null)
    const [viewMode, setViewMode] = useState<'cv' | 'coverLetter'>('cv')

    // Interview Prep State
    const [showPrepModal, setShowPrepModal] = useState(false)
    const [preppingId, setPreppingId] = useState<string | null>(null)
    const [prepKits, setPrepKits] = useState<Record<string, any>>({})

    const docRef = useRef<HTMLDivElement>(null)

    const fetchApplications = async () => {
        setLoading(true)
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data, error } = await supabase
            .from('tailored_documents')
            .select(`
                *,
                jobs (
                    title,
                    company,
                    location,
                    platform,
                    url
                )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Error fetching applications:', error)
        } else {
            setApplications(data || [])
            // Fetch existing prep kits
            fetchPrepKits(user.id)
        }
        setLoading(false)
    }

    const fetchPrepKits = async (userId: string) => {
        const { data, error } = await supabase
            .from('interview_prep_kits')
            .select('*')
            .eq('user_id', userId)

        if (!error && data) {
            const kitMap: Record<string, any> = {}
            data.forEach(kit => {
                kitMap[kit.document_id] = kit.content
            })
            setPrepKits(kitMap)
        }
    }

    const handleGeneratePrepKit = async (app: any) => {
        if (prepKits[app.id]) {
            setSelectedApp(app)
            setShowPrepModal(true)
            return
        }

        setPreppingId(app.id)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) {
                alert('Please sign in to generate a prep kit.')
                return
            }

            const { data: { session } } = await supabase.auth.getSession()
            const response = await fetch('/api/interview-prep', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({
                    jobId: app.job_id,
                    documentId: app.id,
                    profileId: user.id
                })
            })

            const data = await response.json()
            if (!response.ok) throw new Error(data.error || 'Failed to generate prep kit')

            setPrepKits(prev => ({ ...prev, [app.id]: data.content }))
            setSelectedApp(app)
            setShowPrepModal(true)
        } catch (error: any) {
            console.error('Prep Kit error:', error)
            alert('Failed to generate prep kit. Please try again.')
        } finally {
            setPreppingId(null)
        }
    }

    const handleDeleteApplication = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!window.confirm('Are you sure you want to delete this tailored application? This action cannot be undone.')) {
            return
        }

        try {
            const { error } = await supabase
                .from('tailored_documents')
                .delete()
                .eq('id', id)

            if (error) throw error

            setApplications(prev => prev.filter(app => app.id !== id))
        } catch (error: any) {
            console.error('Delete error:', error)
            alert('Failed to delete application. Please try again.')
        }
    }

    const handleExportPDF = async () => {
        if (!docRef.current || !selectedApp) return

        setExporting(true)
        try {
            await document.fonts.ready

            const canvas = await html2canvas(docRef.current, {
                scale: 1.5, // Optimized for file size vs clarity
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false,
                windowWidth: docRef.current.scrollWidth,
                onclone: (clonedDoc) => {
                    // SANITIZATION: html2canvas fails on oklab/oklch (common in Tailwind 4)
                    // 1. Wipe all 'okl' references from all style tags
                    const styleTags = clonedDoc.getElementsByTagName('style');
                    for (let i = 0; i < styleTags.length; i++) {
                        styleTags[i].innerHTML = styleTags[i].innerHTML.replace(/okl[a-z]+\([^)]+\)/g, '#000');
                    }

                    // 2. Iterate ALL elements and sanitize all known color properties
                    const allNodes = clonedDoc.querySelectorAll('*');
                    allNodes.forEach((node: any) => {
                        if (node instanceof HTMLElement) {
                            const s = window.getComputedStyle(node);
                            const props = ['color', 'backgroundColor', 'borderColor', 'fill', 'stroke', 'outlineColor'];

                            props.forEach(p => {
                                const val = (s as any)[p];
                                if (val && val.includes('okl')) {
                                    (node.style as any)[p] = p === 'backgroundColor' ? '#ffffff' : '#000000';
                                }
                            });

                            // Box shadow
                            if (s.boxShadow.includes('okl')) {
                                node.style.boxShadow = 'none';
                            }
                        }
                    });
                }
            })

            const imgData = canvas.toDataURL('image/jpeg', 0.8)
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
                compress: true
            })

            const pdfWidth = pdf.internal.pageSize.getWidth()
            const pageHeight = pdf.internal.pageSize.getHeight()
            const imgWidth = canvas.width
            const imgHeight = canvas.height
            const pdfHeight = (imgHeight * pdfWidth) / imgWidth

            let heightLeft = pdfHeight
            let position = 0

            // Add first page
            pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight)
            heightLeft -= pageHeight

            // Add additional pages if content overflows
            while (heightLeft > 0) {
                position = heightLeft - pdfHeight
                pdf.addPage()
                pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, pdfHeight)
                heightLeft -= pageHeight
            }

            const filename = viewMode === 'cv'
                ? `CV-Tailored-${selectedApp.jobs?.company || 'Job'}.pdf`
                : `Cover-Letter-Tailored-${selectedApp.jobs?.company || 'Job'}.pdf`

            pdf.save(filename)
        } catch (error) {
            console.error('PDF Export Error:', error)
            alert('Failed to generate PDF. Please try again.')
        } finally {
            setExporting(false)
        }
    }

    useEffect(() => {
        fetchApplications()
    }, [])

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
            <Sidebar />

            {/* Main Content */}

            {/* Main Content */}
            <main className="flex-1 pl-20 lg:pl-72 h-screen overflow-y-auto">
                <div className="max-w-[1200px] mx-auto p-8 lg:p-12">
                    <header className="mb-12">
                        <h1 className="text-4xl font-black tracking-tight mb-3 text-white">My Applications</h1>
                        <p className="text-muted font-medium">Manage and view your tailored CVs and cover letters.</p>
                    </header>

                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 glass rounded-3xl border border-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {applications.length > 0 ? (
                                applications.map((app) => (
                                    <div key={app.id} className="glass group p-6 rounded-3xl border border-white/5 hover:border-primary/30 transition-all flex items-center justify-between">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-primary/10 transition-colors">
                                                <Briefcase size={26} className="text-muted group-hover:text-primary transition-colors" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white mb-1">{app.title || app.jobs?.title}</h3>
                                                <p className="text-muted text-sm font-medium flex items-center gap-2">
                                                    {app.jobs?.company} • {app.jobs?.location || 'Remote'} • {app.jobs?.platform}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${app.status === 'draft' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' : 'border-green-500/30 text-green-500 bg-green-500/5'}`}>
                                                {app.status}
                                            </span>
                                            {app.jobs?.url && (
                                                <a
                                                    href={app.jobs.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-muted hover:text-white transition-all cursor-pointer flex items-center gap-2 border border-white/5"
                                                    title="Original Listing"
                                                >
                                                    <ExternalLink size={18} />
                                                </a>
                                            )}
                                            <button
                                                onClick={() => setSelectedApp(app)}
                                                className="p-3 bg-white/5 hover:bg-primary rounded-xl text-muted hover:text-white transition-all cursor-pointer flex items-center gap-2"
                                            >
                                                <Eye size={18} />
                                                <span className="hidden sm:inline font-bold text-xs">View Draft</span>
                                            </button>
                                            <button
                                                onClick={() => handleGeneratePrepKit(app)}
                                                disabled={preppingId === app.id}
                                                className={`p-3 rounded-xl transition-all cursor-pointer flex items-center gap-2 border shadow-lg ${prepKits[app.id] ? 'bg-accent/10 border-accent/30 text-accent hover:bg-accent/20' : 'bg-primary/10 border-primary/30 text-primary hover:bg-primary/20'} disabled:opacity-50`}
                                            >
                                                {preppingId === app.id ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} />}
                                                <span className="hidden sm:inline font-bold text-xs">
                                                    {prepKits[app.id] ? 'Interview Ready' : preppingId === app.id ? 'Analyzing...' : 'Prep Kit'}
                                                </span>
                                            </button>
                                            <button
                                                onClick={(e) => handleDeleteApplication(app.id, e)}
                                                className="p-3 bg-white/5 hover:bg-red-500 rounded-xl text-muted hover:text-white transition-all cursor-pointer border border-white/5"
                                                title="Delete Application"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="flex flex-col items-center justify-center py-32 text-center glass rounded-[3rem] border-dashed border-2 border-white/10">
                                    <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mb-6 text-muted">
                                        <FileText size={40} />
                                    </div>
                                    <h2 className="text-2xl font-black mb-2 text-white">No Applications Yet</h2>
                                    <p className="text-muted max-w-sm font-medium">Tailor your first job application from the dashboard to see it appear here.</p>
                                    <Link href="/dashboard" className="mt-8 px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-2xl font-black transition-all">
                                        Back to Dashboard
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Document View Modal */}
            {selectedApp && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-8">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedApp(null)} />
                    <div className="relative w-full max-w-5xl h-full max-h-[90vh] bg-slate-950 rounded-[2.5rem] border border-white/10 overflow-hidden flex flex-col shadow-2xl animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-6 sm:px-10 border-b border-white/5 flex items-center justify-between bg-white/5">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-black text-white">{selectedApp.jobs?.title}</h2>
                                <p className="text-muted text-sm font-medium">{selectedApp.jobs?.company}</p>
                            </div>
                            <button
                                onClick={() => setSelectedApp(null)}
                                className="p-2 hover:bg-white/10 rounded-full text-muted hover:text-white transition-all cursor-pointer"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Controls */}
                        <div className="px-6 sm:px-10 py-4 border-b border-white/5 flex items-center justify-between">
                            <div className="flex p-1 bg-white/5 rounded-xl border border-white/5">
                                <button
                                    onClick={() => setViewMode('cv')}
                                    className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'cv' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:text-white'}`}
                                >
                                    Tailored CV
                                </button>
                                <button
                                    onClick={() => setViewMode('coverLetter')}
                                    className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${viewMode === 'coverLetter' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted hover:text-white'}`}
                                >
                                    Cover Letter
                                </button>
                            </div>
                            <button
                                onClick={handleExportPDF}
                                disabled={exporting}
                                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all text-white disabled:opacity-50"
                            >
                                {exporting ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Download size={16} />
                                )}
                                <span className="hidden sm:inline">{exporting ? 'Generating...' : 'Export PDF'}</span>
                            </button>
                        </div>

                        {/* Document Content */}
                        <div className="flex-1 overflow-y-auto bg-slate-900/50">
                            <div className="min-h-full w-full flex flex-col items-center py-20 px-4">
                                {/* Explicit styles for PDF capture */}
                                <style>{`
                                    .cv-document {
                                        font-family: 'Open Sans', sans-serif !important;
                                        color: #0f172a !important;
                                        line-height: 1.6 !important;
                                    }
                                    .cv-document h1 {
                                        font-family: 'Poppins', sans-serif !important;
                                        font-size: 32pt !important;
                                        font-weight: 700 !important;
                                        color: #0891B2 !important;
                                        margin-bottom: 8pt !important;
                                        text-transform: uppercase !important;
                                        letter-spacing: -1pt !important;
                                    }
                                    .cv-document h2 {
                                        font-family: 'Poppins', sans-serif !important;
                                        font-size: 14pt !important;
                                        font-weight: 700 !important;
                                        color: #0891B2 !important;
                                        margin-top: 18pt !important;
                                        margin-bottom: 6pt !important;
                                        text-transform: uppercase !important;
                                        letter-spacing: 1pt !important;
                                    }
                                    .cv-document h3 {
                                        font-size: 12pt !important;
                                        font-weight: 700 !important;
                                        color: #0f172a !important;
                                        margin-top: 12pt !important;
                                        margin-bottom: 4pt !important;
                                    }
                                    .cv-document p {
                                        font-size: 11pt !important;
                                        color: #475569 !important;
                                        margin-bottom: 8pt !important;
                                    }
                                    .cv-document hr {
                                        border: none !important;
                                        border-top: 1pt solid #e2e8f0 !important;
                                        margin-top: 4pt !important;
                                        margin-bottom: 12pt !important;
                                    }
                                    .cv-document ul {
                                        margin-bottom: 12pt !important;
                                        list-style-type: disc !important;
                                        padding-left: 18pt !important;
                                    }
                                    .cv-document li {
                                        font-size: 11pt !important;
                                        color: #475569 !important;
                                        margin-bottom: 4pt !important;
                                    }
                                    .cv-document strong {
                                        color: #0f172a !important;
                                        font-weight: 700 !important;
                                    }
                                `}</style>

                                {/* A4 Paper Styling */}
                                <div
                                    className="w-full max-w-[800px] bg-white text-[#0f172a] shadow-2xl p-8 sm:p-16 min-h-[1100px] flex-shrink-0 cv-document"
                                    ref={docRef}
                                >
                                    <div className="max-w-none">
                                        <ReactMarkdown rehypePlugins={[rehypeSanitize]}>
                                            {(viewMode === 'cv' ? selectedApp.cv_content : selectedApp.cover_letter_content
                                                ?.replace(/\[(Your|Phone|Email|LinkedIn|Address|Link)[^\]]*\]/gi, '')) || ''}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* AI Interview Prep Modal */}
            {selectedApp && prepKits[selectedApp.id] && (
                <InterviewPrepModal
                    isOpen={showPrepModal}
                    onClose={() => setShowPrepModal(false)}
                    jobTitle={selectedApp.jobs?.title}
                    company={selectedApp.jobs?.company}
                    content={prepKits[selectedApp.id]}
                />
            )}
        </div>
    )
}
