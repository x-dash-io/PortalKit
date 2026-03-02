'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    FolderKanban,
    FileText,
    CheckCircle2,
    Settings,
    Bell,
    PanelLeftClose,
    PanelLeftOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useUIStore } from '@/lib/store';
import { Button } from '@/components/ui/button';

import { ThemeSwitcher } from '@/components/themes/ThemeSwitcher';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/dashboard/projects', icon: FolderKanban },
    { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

export function GlassNav() {
    const pathname = usePathname();
    const { sidebarOpen, setSidebarOpen } = useUIStore();

    return (
        <>
            {/* Desktop Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 260 : 88 }}
                className={cn(
                    "hidden md:flex flex-col fixed left-0 top-0 h-screen glass-card rounded-none border-y-0 border-l-0 z-50 transition-all duration-500",
                    !sidebarOpen && "items-center"
                )}
            >
                <div className="p-8 flex items-center justify-between w-full">
                    {sidebarOpen && (
                        <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-2xl font-black tracking-tighter text-[var(--accent)]"
                        >
                            PortalKit
                        </motion.span>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hover:bg-[var(--accent-light)] hover:text-[var(--accent)] rounded-xl"
                    >
                        {sidebarOpen ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
                    </Button>
                </div>

                <nav className="flex-1 px-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link key={item.name} href={item.href}>
                                <div className={cn(
                                    "flex items-center p-3.5 rounded-2xl transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "bg-[var(--accent-light)] text-[var(--accent)]"
                                        : "hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                                )}>
                                    <item.icon size={22} className={cn("transition-colors", isActive && "text-[var(--accent)]")} />
                                    {sidebarOpen && <span className="ml-3 font-bold text-sm tracking-tight">{item.name}</span>}
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-active"
                                            className="absolute left-0 w-1.5 h-6 bg-[var(--accent)] rounded-r-full shadow-[0_0_10px_var(--accent)]"
                                        />
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 space-y-6">
                    <div className="divider" />
                    <div className={cn("flex flex-col gap-4", !sidebarOpen && "items-center")}>
                        {sidebarOpen && <span className="text-[10px] uppercase font-black tracking-widest text-[var(--text-muted)] ml-2">App Theme</span>}
                        <ThemeSwitcher />
                    </div>
                </div>
            </motion.aside>

            {/* Mobile Bottom Nav */}
            <nav className="md:hidden fixed bottom-6 left-6 right-6 h-18 glass-card flex items-center justify-around z-50 px-4 rounded-3xl border-white/10 shadow-2xl shadow-black/20">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.name} href={item.href} className="flex flex-col items-center">
                            <div className={cn(
                                "p-3 rounded-2xl transition-all duration-300",
                                isActive
                                    ? "bg-[var(--accent-light)] text-[var(--accent)] scale-110 shadow-lg"
                                    : "text-[var(--text-secondary)]"
                            )}>
                                <item.icon size={24} />
                            </div>
                        </Link>
                    );
                })}
                <div className="w-10 h-10 flex items-center justify-center">
                    <ThemeSwitcher />
                </div>
            </nav>
        </>
    );
}
