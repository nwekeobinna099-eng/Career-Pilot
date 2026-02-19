'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, Loader2, ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        // Validate email format
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`,
            })

            if (error) throw error

            setSuccess(true)
        } catch (err: any) {
            if (err.message?.includes('Email rate limit exceeded')) {
                setError('Too many attempts. Please wait a moment and try again.')
            } else {
                setError(err.message || 'Failed to send reset email. Please try again.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 relative overflow-hidden selection:bg-primary/30">
            {/* Dynamic Background */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 blur-[120px] rounded-full animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-500/5 blur-[120px] rounded-full animate-pulse delay-1000" />

            <div className="relative z-10 w-full max-w-lg">
                <div className="flex justify-center mb-8">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-primary/20 bg-white/5">
                            <img 
                                src="/logo.png" 
                                alt="CareerPilot Logo" 
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent uppercase">
                            CareerPilot
                        </span>
                    </Link>
                </div>

                <div className="glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/10 glow-primary backdrop-blur-xl">
                    {!success ? (
                        <>
                            <div className="flex justify-center mb-8">
                                <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary glow-primary">
                                    <Mail size={32} />
                                </div>
                            </div>

                            <h1 className="text-3xl font-black text-center mb-2 uppercase tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                Reset Password
                            </h1>
                            <p className="text-muted text-center mb-8 font-medium">
                                Enter your email address and we'll send you a link to reset your password.
                            </p>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                    <XCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2 ml-1">Email Address</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type="email"
                                            required
                                            autoComplete="email"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        'SEND RESET LINK'
                                    )}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-8">
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center text-green-500">
                                    <CheckCircle size={32} />
                                </div>
                            </div>

                            <h1 className="text-3xl font-black text-center mb-2 uppercase tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                Check Your Email
                            </h1>
                            <p className="text-muted text-center mb-8 font-medium">
                                We've sent a password reset link to <span className="text-white font-bold">{email}</span>
                            </p>
                            
                            <p className="text-white/60 text-sm">
                                Didn't receive the email? Check your spam folder or{' '}
                                <button 
                                    onClick={() => setSuccess(false)}
                                    className="text-primary hover:text-primary/80 underline underline-offset-4"
                                >
                                    try again
                                </button>
                            </p>
                        </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <Link
                            href="/login"
                            className="inline-flex items-center gap-2 text-muted hover:text-primary transition-colors font-bold"
                        >
                            <ArrowLeft size={16} />
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
