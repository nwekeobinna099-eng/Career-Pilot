'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Lock, Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function ResetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const passwordRequirements = useMemo(() => [
        { met: password.length >= 8, text: 'At least 8 characters' },
        { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
        { met: /[a-z]/.test(password), text: 'One lowercase letter' },
        { met: /[0-9]/.test(password), text: 'One number' },
    ], [password])

    const isPasswordValid = useMemo(() => 
        passwordRequirements.every(req => req.met), 
    [passwordRequirements])

    const passwordsMatch = useMemo(() => 
        password === confirmPassword && confirmPassword.length > 0,
    [password, confirmPassword])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        if (!isPasswordValid) {
            setError('Please meet all password requirements')
            setLoading(false)
            return
        }

        if (!passwordsMatch) {
            setError('Passwords do not match')
            setLoading(false)
            return
        }

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            setSuccess(true)
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                router.push('/login')
            }, 3000)
        } catch (err: any) {
            if (err.message?.includes('Token')) {
                setError('Invalid or expired reset link. Please request a new password reset.')
            } else {
                setError(err.message || 'Failed to reset password. Please try again.')
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
                                    <Lock size={32} />
                                </div>
                            </div>

                            <h1 className="text-3xl font-black text-center mb-2 uppercase tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                                New Password
                            </h1>
                            <p className="text-muted text-center mb-8 font-medium">
                                Enter a new password for your account.
                            </p>

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                                    <XCircle size={16} />
                                    {error}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2 ml-1">New Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            autoComplete="new-password"
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2 ml-1">Confirm Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            required
                                            autoComplete="new-password"
                                            className={`w-full bg-white/5 border rounded-2xl py-4 pl-12 pr-12 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 transition-all font-bold ${
                                                confirmPassword.length > 0 
                                                    ? passwordsMatch 
                                                        ? 'border-green-500/50 focus:ring-green-500/50' 
                                                        : 'border-red-500/50 focus:ring-red-500/50'
                                                    : 'border-white/10 focus:ring-primary/50'
                                            }`}
                                            placeholder="••••••••"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                        />
                                    </div>
                                    {confirmPassword.length > 0 && !passwordsMatch && (
                                        <p className="text-red-400 text-xs mt-2 font-bold">Passwords do not match</p>
                                    )}
                                </div>

                                <div className="space-y-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-3">Password Requirements</p>
                                    {passwordRequirements.map((req, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            {req.met ? (
                                                <CheckCircle size={14} className="text-green-500" />
                                            ) : (
                                                <XCircle size={14} className="text-white/20" />
                                            )}
                                            <span className={`text-xs font-bold ${req.met ? 'text-green-400' : 'text-white/40'}`}>
                                                {req.text}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading || !isPasswordValid || !passwordsMatch}
                                    className="w-full py-5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={24} />
                                    ) : (
                                        'RESET PASSWORD'
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
                                Password Reset!
                            </h1>
                            <p className="text-muted text-center mb-8 font-medium">
                                Your password has been successfully reset.
                            </p>
                            
                            <p className="text-white/60 text-sm">
                                Redirecting to login page...
                            </p>
                        </div>
                    )}

                    <div className="mt-8 pt-8 border-t border-white/5 text-center">
                        <Link
                            href="/login"
                            className="text-muted hover:text-primary transition-colors font-bold text-sm"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </main>
    )
}
