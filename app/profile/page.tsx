'use client'

import ProfileForm from '@/components/ProfileForm'
import FileUpload from '@/components/FileUpload'
import Sidebar from '@/components/Sidebar'
import React, { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
    const [parsedData, setParsedData] = useState<any>(null)

    return (
        <div className="min-h-screen bg-background text-foreground flex font-sans overflow-hidden">
            <Sidebar />

            <main className="flex-1 pl-20 lg:pl-72 h-screen overflow-y-auto">
                <div className="max-w-4xl mx-auto p-8 lg:p-12 mb-12">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 text-muted hover:text-primary transition-all font-black text-xs uppercase tracking-[0.2em] group"
                    >
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                </div>

                <div className="max-w-4xl mx-auto mb-16 text-center">
                    <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent uppercase tracking-tight">
                        Universal Profile
                    </h1>
                    <p className="text-muted text-xl max-w-2xl mx-auto font-medium leading-relaxed">
                        Keep your base experience and certifications up to date. We use this information to tailor every application you make.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12">
                    <section className="max-w-4xl mx-auto w-full">
                        <FileUpload
                            onUploadComplete={() => {}}
                            onParsed={(data) => setParsedData(data)}
                        />
                    </section>

                    <ProfileForm externalData={parsedData} />
                </div>
            </main>
        </div>
    )
}
