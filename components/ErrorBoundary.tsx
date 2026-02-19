'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, Home, RefreshCw } from 'lucide-react'
import Link from 'next/link'

interface Props {
    children: ReactNode
    fallback?: ReactNode
}

interface State {
    hasError: boolean
    error?: Error
}

export default class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)
    }

    handleReload = () => {
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6">
                    <div className="max-w-md w-full glass rounded-[3rem] border border-white/10 p-8 text-center">
                        <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle size={40} className="text-red-500" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tight">
                            System Error
                        </h1>
                        <p className="text-muted mb-8 font-medium">
                            Something went wrong. Please try again or return to the dashboard.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-primary hover:bg-primary/90 rounded-2xl font-black text-white transition-all"
                            >
                                <RefreshCw size={18} />
                                Reload Page
                            </button>
                            <Link
                                href="/dashboard"
                                className="flex items-center justify-center gap-2 px-6 py-3 glass hover:bg-white/10 rounded-2xl font-black text-white transition-all"
                            >
                                <Home size={18} />
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
