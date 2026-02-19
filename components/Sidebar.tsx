'use client'

import React from 'react'
import { LayoutDashboard, Briefcase, User, Bell, Settings, LogOut, BarChart3, Menu, X, Zap } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Sidebar() {
    const pathname = usePathname()
    const router = useRouter()
    const [isOpen, setIsOpen] = React.useState(false)

    const handleSignOut = async () => {
        await supabase.auth.signOut()
        router.push('/login')
    }

    const navItems = [
        { icon: <LayoutDashboard size={22} />, label: 'Dashboard', href: '/dashboard' },
        { icon: <Briefcase size={22} />, label: 'My Applications', href: '/applications' },
        { icon: <BarChart3 size={22} />, label: 'Career Analytics', href: '/analytics' },
        { icon: <User size={22} />, label: 'Universal Profile', href: '/profile' },
        { icon: <Bell size={22} />, label: 'Alerts', href: '/alerts' },
        { icon: <Zap size={22} />, label: 'Plans', href: '/plans' },
    ]

    const NavContent = () => (
        <>
            <div className="px-6 mb-12 flex items-center gap-3">
                <Link href="/dashboard" className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center shadow-lg shadow-primary/20 cursor-pointer relative">
                    <Image
                        src="/logo.png"
                        alt="CareerPilot Logo"
                        fill
                        className="object-cover"
                    />
                </Link>
                <Link href="/dashboard" className="text-xl font-black tracking-tighter uppercase hidden lg:block text-white cursor-pointer hover:text-primary transition-colors">CareerPilot</Link>
            </div>

            <nav className="flex-1 w-full px-4 space-y-2">
                {navItems.map((item, i) => {
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={i}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer group ${isActive ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-muted hover:bg-white/5 hover:text-white'}`}
                        >
                            <div className={`${isActive ? 'text-primary' : 'group-hover:text-white'}`}>{item.icon}</div>
                            <span className="block lg:block text-sm uppercase tracking-wide">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="w-full px-4 mt-auto pt-8 border-t border-white/5 space-y-2">
                <Link
                    href="/settings"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer group ${pathname === '/settings' ? 'bg-primary/10 text-primary font-bold shadow-sm' : 'text-muted hover:bg-white/5 hover:text-white'}`}
                >
                    <Settings size={22} className={pathname === '/settings' ? 'text-primary' : 'group-hover:text-white'} />
                    <span className="block lg:block text-sm uppercase tracking-wide">Settings</span>
                </Link>
                <button
                    onClick={() => {
                        handleSignOut()
                        setIsOpen(false)
                    }}
                    className="flex items-center gap-4 p-4 rounded-2xl text-muted hover:bg-red-500/10 hover:text-red-400 transition-all w-full cursor-pointer">
                    <LogOut size={22} />
                    <span className="block lg:block text-sm uppercase tracking-wide font-bold">Sign Out</span>
                </button>
            </div>
        </>
    )

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 glass border-b border-white/5 z-[60] flex items-center justify-between px-6">
                <Link href="/dashboard" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg overflow-hidden relative">
                        <Image src="/logo.png" alt="Logo" fill className="object-cover" />
                    </div>
                    <span className="text-lg font-black tracking-tighter uppercase text-white">CareerPilot</span>
                </Link>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-white glass rounded-lg border border-white/10"
                >
                    <Menu size={24} />
                </button>
            </div>

            {/* Mobile Drawer Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Mobile Drawer */}
            <aside className={`lg:hidden fixed left-0 top-0 h-full w-[280px] bg-background border-r border-white/5 flex flex-col py-8 z-[80] transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <button
                    onClick={() => setIsOpen(false)}
                    className="absolute top-6 right-6 p-2 text-muted hover:text-white"
                >
                    <X size={24} />
                </button>
                <NavContent />
            </aside>

            {/* Desktop Sidebar */}
            <aside className="fixed left-0 top-0 h-full w-20 lg:w-72 glass border-r border-white/5 hidden lg:flex flex-col items-center lg:items-start py-8 z-50">
                <NavContent />
            </aside>
        </>
    )
}
