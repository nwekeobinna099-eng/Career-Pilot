'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Loader2, ArrowRight, UserPlus, LogIn, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

interface AuthFormProps {
    mode: 'login' | 'signup'
}

export default function AuthForm({ mode }: AuthFormProps) {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)

    const passwordRequirements = useMemo(() => [
        { met: password.length >= 8, text: 'At least 8 characters' },
        { met: /[A-Z]/.test(password), text: 'One uppercase letter' },
        { met: /[a-z]/.test(password), text: 'One lowercase letter' },
        { met: /[0-9]/.test(password), text: 'One number' },
    ], [password])

    const isPasswordValid = useMemo(() =>
        passwordRequirements.every(req => req.met),
        [passwordRequirements])

    const isFormValid = useMemo(() => {
        const emailValid = email.length > 0
        if (mode === 'signup') {
            const passwordValid = password.length >= 8
            return emailValid && passwordValid
        }
        return emailValid && password.length > 0
    }, [email, password, mode])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        setSuccessMessage(null)

        try {
            if (mode === 'signup') {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${window.location.origin}/dashboard`,
                    },
                })
                if (error) throw error
                setSuccessMessage('Account created! Please check your email to verify your account.')
            } else {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error

                if (data?.session) {
                    // Wait for session to be established and cookie to be set
                    await new Promise(resolve => setTimeout(resolve, 500))
                    router.push('/dashboard')
                    router.refresh()
                } else {
                    setError('Login failed. Please verify your email first.')
                }
            }
        } catch (err: any) {
            console.error('Auth error:', err)
            // Handle specific error messages
            if (err.message?.includes('Invalid login credentials')) {
                setError('Invalid email or password. Please try again.')
            } else if (err.message?.includes('User already registered')) {
                setError('An account with this email already exists.')
            } else if (err.message?.includes('Email rate limit exceeded')) {
                setError('Too many attempts. Please wait a moment and try again.')
            } else if (err.message?.includes('Email not confirmed')) {
                setError('Please verify your email address first.')
            } else {
                setError(err.message || 'An unexpected error occurred. Check console for details.')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto">
            <div className="glass p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/10 glow-primary backdrop-blur-xl">
                <div className="flex justify-center mb-8">
                    <div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary glow-primary">
                        {mode === 'login' ? <LogIn size={32} /> : <UserPlus size={32} />}
                    </div>
                </div>

                <h1 className="text-3xl font-black text-center mb-2 uppercase tracking-tight bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                    {mode === 'login' ? 'Welcome Back' : 'Join CareerPilot'}
                </h1>
                <p className="text-muted text-center mb-8 font-medium">
                    {mode === 'login'
                        ? 'Log in to continue your career ascent.'
                        : 'Start automating your job applications today.'}
                </p>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <XCircle size={16} />
                        {error}
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                        <CheckCircle size={16} />
                        {successMessage}
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

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-white/40 mb-2 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-primary transition-colors" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
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

                    {mode === 'login' && (
                        <div className="flex justify-end">
                            <Link
                                href="/forgot-password"
                                className="text-xs font-bold text-white/40 hover:text-primary transition-colors"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    )}

                    {mode === 'signup' && (
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
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-500 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl shadow-primary/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 group"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={24} />
                        ) : (
                            <>
                                {mode === 'login' ? 'LOG IN' : 'CREATE ACCOUNT'}
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                    <p className="text-muted text-sm font-bold uppercase tracking-tight">
                        {mode === 'login'
                            ? "Don't have an account?"
                            : "Already have an account?"}{' '}
                        <Link
                            href={mode === 'login' ? '/signup' : '/login'}
                            className="text-primary hover:text-primary/80 transition-colors ml-1 underline underline-offset-4"
                        >
                            {mode === 'login' ? 'Sign up' : 'Log in'}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
