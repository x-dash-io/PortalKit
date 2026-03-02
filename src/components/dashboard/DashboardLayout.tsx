'use client';

import { GlassNav } from '@/components/dashboard/GlassNav';
import { useUIStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Bell, Search, User, LogOut, CreditCard, Settings } from 'lucide-react';
import { NotificationBell } from '@/components/dashboard/NotificationBell';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { signOut, useSession } from 'next-auth/react';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassButton } from '@/components/glass/GlassButton';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { sidebarOpen } = useUIStore();
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-[var(--bg-base)]">
            <GlassNav />

            <motion.div
                initial={false}
                animate={{
                    paddingLeft: sidebarOpen ? '260px' : '88px',
                }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="flex flex-col min-h-screen transition-all md:pb-0 pb-20"
            >
                {/* Top Header */}
                <header className="h-20 flex items-center justify-between px-10 bg-white/5 backdrop-blur-xl border-b border-white/5 sticky top-0 z-40">
                    <div className="flex items-center flex-1 max-w-lg">
                        <GlassInput
                            placeholder="Search projects, files..."
                            icon={<Search size={18} />}
                            className="bg-transparent border-transparent focus:border-indigo-500/30"
                        />
                    </div>

                    <div className="flex items-center gap-6 ml-8">
                        <NotificationBell />

                        <div className="h-8 w-px bg-white/5" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-4 p-1 rounded-2xl hover:bg-white/5 transition-all outline-none group text-left">
                                    <Avatar className="h-10 w-10 border-2 border-white/10 group-hover:border-indigo-500/50 transition-colors shadow-lg shadow-black/20">
                                        <AvatarImage src={session?.user?.image || ''} />
                                        <AvatarFallback className="bg-indigo-600 text-white font-black">
                                            {session?.user?.name?.[0] || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden lg:block">
                                        <p className="text-sm font-black leading-none text-white">{session?.user?.name}</p>
                                        <p className="text-[10px] text-[var(--text-muted)] mt-1 font-bold uppercase tracking-widest">
                                            {session?.user?.plan === 'pro' ? 'Pro Partner' : 'Starter'}
                                        </p>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass-card w-64 border-white/10 p-2 rounded-2xl mt-4 animate-in fade-in zoom-in duration-200">
                                <DropdownMenuLabel className="px-3 py-2 text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Account Settings</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-white/5 mx-2 my-1" />
                                <DropdownMenuItem className="focus:bg-indigo-600/10 focus:text-indigo-400 rounded-xl cursor-pointer py-3 px-3 gap-3 transition-colors">
                                    <User size={18} />
                                    <span className="font-bold">Profile Details</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem className="focus:bg-indigo-600/10 focus:text-indigo-400 rounded-xl cursor-pointer py-3 px-3 gap-3 transition-colors">
                                    <CreditCard size={18} />
                                    <span className="font-bold">Subscription</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-white/5 mx-2 my-1" />
                                <DropdownMenuItem
                                    className="focus:bg-red-500/10 text-red-400 rounded-xl cursor-pointer py-3 px-3 gap-3 transition-colors"
                                    onClick={() => signOut({ callbackUrl: '/' })}
                                >
                                    <LogOut size={18} />
                                    <span className="font-bold">Sign Out</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="p-10 flex-1 relative">
                    <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.03),transparent_50%)] pointer-events-none" />
                    {children}
                </main>
            </motion.div>
        </div>
    );
}
