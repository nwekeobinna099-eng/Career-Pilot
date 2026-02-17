'use client'

import React, { useState } from 'react'
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function FileUpload({ onUploadComplete }: { onUploadComplete: (url: string) => void }) {
    const [uploading, setUploading] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setError(null)
            const file = event.target.files?.[0]
            if (!file) return

            if (file.type !== 'application/pdf') {
                setError('Please upload a PDF file')
                return
            }

            setUploading(true)
            setFileName(file.name)

            const fileExt = file.name.split('.').pop()
            const filePath = `${Math.random()}.${fileExt}`

            const { data, error: uploadError } = await supabase.storage
                .from('cv-uploads')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('cv-uploads')
                .getPublicUrl(filePath)

            onUploadComplete(publicUrl)
        } catch (err: any) {
            setError(err.message || 'Error uploading file')
            setFileName(null)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="w-full">
            <label className="block text-sm font-medium mb-4 opacity-80">Upload Existing CV (PDF)</label>
            <div className="relative group mt-2">
                <input
                    type="file"
                    accept=".pdf"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                />
                <div className={`
          border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center transition-all glass
          ${uploading ? 'bg-primary/5 border-primary/50' : 'border-white/10 hover:bg-white/5 hover:border-white/20'}
          ${error ? 'border-red-500/50 bg-red-500/5' : ''}
        `}>
                    {uploading ? (
                        <>
                            <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
                            <p className="text-sm text-blue-400">Uploading {fileName}...</p>
                        </>
                    ) : fileName && !error ? (
                        <>
                            <CheckCircle className="text-green-500 mb-3" size={32} />
                            <p className="text-sm text-green-400">Successfully selected: {fileName}</p>
                            <p className="text-xs opacity-50 mt-1">Click or drag to replace</p>
                        </>
                    ) : (
                        <>
                            <Upload className="text-white/40 mb-3 group-hover:text-white/60 transition-colors" size={32} />
                            <p className="text-sm opacity-80">Click to upload or drag & drop</p>
                            <p className="text-xs opacity-40 mt-1">PDF only (Max 5MB)</p>
                        </>
                    )}
                </div>
            </div>
            {error && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                    <AlertCircle size={16} />
                    {error}
                </div>
            )}
        </div>
    )
}
