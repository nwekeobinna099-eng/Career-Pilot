'use client'

import React, { useState } from 'react'
import { Upload, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function FileUpload({
    onUploadComplete,
    onParsed
}: {
    onUploadComplete: (url: string) => void,
    onParsed?: (data: any) => void
}) {
    const [uploading, setUploading] = useState(false)
    const [parsing, setParsing] = useState(false)
    const [fileName, setFileName] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setError(null)
            const file = event.target.files?.[0]
            if (!file) return

            const allowedTypes = [
                'application/pdf',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ]

            // Max file size: 5MB
            const MAX_FILE_SIZE = 5 * 1024 * 1024

            if (!allowedTypes.includes(file.type)) {
                setError('Please upload a PDF or DOCX file')
                return
            }

            if (file.size > MAX_FILE_SIZE) {
                setError('File too large. Maximum size is 5MB.')
                return
            }

            setUploading(true)
            setFileName(file.name)

            const fileExt = file.name.split('.').pop()
            const filePath = `${crypto.randomUUID()}.${fileExt}`

            const { data, error: uploadError } = await supabase.storage
                .from('cv-uploads')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('cv-uploads')
                .getPublicUrl(filePath)

            onUploadComplete(publicUrl)

            // Auto-parse if callback provided
            if (onParsed) {
                setParsing(true)
                try {
                    const { data: { session } } = await supabase.auth.getSession()
                    const parseResponse = await fetch('/api/parse-cv', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${session?.access_token}`
                        },
                        body: JSON.stringify({ publicUrl })
                    })
                    const parsedData = await parseResponse.json()
                    if (parsedData.error) throw new Error(parsedData.error)
                    onParsed(parsedData)
                } catch (parseErr: any) {
                    console.error('Parsing failed:', parseErr)
                    if (parseErr.message?.includes('429') || parseErr.message?.toLowerCase().includes('quota')) {
                        setError('AI rate limit reached. Please wait about a minute before trying again, or fill in your details manually.')
                    } else {
                        setError('Upload successful, but AI parsing failed. You can still fill details manually.')
                    }
                } finally {
                    setParsing(false)
                }
            }
        } catch (err: any) {
            setError(err.message || 'Error uploading file')
            setFileName(null)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="w-full">
            <label className="block text-sm font-medium mb-4 opacity-80">Upload Existing CV (PDF or DOCX)</label>
            <div className="relative group mt-2">
                <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleUpload}
                    disabled={uploading}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                />
                <div className={`
                    border-2 border-dashed rounded-xl lg:rounded-[2rem] p-6 lg:p-10 flex flex-col items-center justify-center transition-all glass
                    ${uploading ? 'bg-primary/5 border-primary/50' : 'border-white/10 hover:bg-white/5 hover:border-white/20'}
                    ${error ? 'border-red-500/50 bg-red-500/5' : ''}
                `}>
                    {uploading ? (
                        <>
                            <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
                            <p className="text-sm text-blue-400">Uploading {fileName}...</p>
                        </>
                    ) : parsing ? (
                        <>
                            <Loader2 className="animate-spin text-primary mb-3" size={32} />
                            <p className="text-sm text-primary font-bold animate-pulse">Reading your CV with AI...</p>
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
                            <p className="text-xs opacity-40 mt-1">PDF or DOCX (Max 5MB)</p>
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
