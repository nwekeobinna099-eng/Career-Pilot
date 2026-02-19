import AuthForm from '@/components/AuthForm'
import Link from 'next/link'

export default function SignupPage() {
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

                <AuthForm mode="signup" />
            </div>
        </main>
    )
}
