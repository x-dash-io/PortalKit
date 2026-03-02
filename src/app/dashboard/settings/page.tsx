'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import {
    Bell,
    Mail,
    Shield,
    User as UserIcon,
    Save,
    CheckCircle2,
    Eye,
    FileText,
    Clock
} from 'lucide-react';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassButton } from '@/components/glass/GlassButton';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { data: session, update } = useSession();
    const [loading, setLoading] = useState(false);
    const [preferences, setPreferences] = useState({
        invoiceViewed: true,
        approvalResponded: true,
        portalVisited: false,
        overdueReminders: true,
    });

    useEffect(() => {
        if ((session?.user as any)?.emailPreferences) {
            setPreferences((session.user as any).emailPreferences);
        }
    }, [session]);

    const handleToggle = (key: string) => {
        setPreferences(prev => ({
            ...prev,
            [key]: !prev[key as keyof typeof prev]
        }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/user/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailPreferences: preferences }),
            });

            if (!res.ok) throw new Error('Failed to save settings');

            toast.success('Preferences saved successfully');
            // Update session to reflect changes locally if needed
            await update({
                ...session,
                user: {
                    ...session?.user,
                    emailPreferences: preferences
                }
            });
        } catch (error) {
            toast.error('Error saving preferences');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            <header>
                <h1 className="text-4xl font-black tracking-tight text-white mb-2">Settings</h1>
                <p className="text-[var(--text-secondary)] font-medium">Manage your account and notification preferences.</p>
            </header>

            <div className="grid md:grid-cols-3 gap-8">
                <aside className="space-y-2">
                    <nav className="flex flex-col gap-1">
                        {[
                            { name: 'Notifications', icon: Bell, active: true },
                            { name: 'Profile', icon: UserIcon, active: false },
                            { name: 'Security', icon: Shield, active: false },
                        ].map(item => (
                            <button
                                key={item.name}
                                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${item.active
                                        ? "bg-[var(--accent-light)] text-[var(--accent)]"
                                        : "text-[var(--text-muted)] hover:text-white hover:bg-white/5"
                                    }`}
                            >
                                <item.icon size={18} />
                                {item.name}
                            </button>
                        ))}
                    </nav>
                </aside>

                <div className="md:col-span-2 space-y-6">
                    <GlassCard className="p-8">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-inner">
                                <Mail className="text-indigo-400" size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white">Email Notifications</h2>
                                <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Control when we contact you</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <PreferenceToggle
                                icon={<FileText className="text-emerald-400" size={18} />}
                                title="Invoice Viewed"
                                description="Get notified when a client opens one of your invoices."
                                checked={preferences.invoiceViewed}
                                onCheckedChange={() => handleToggle('invoiceViewed')}
                            />
                            <PreferenceToggle
                                icon={<CheckCircle2 className="text-purple-400" size={18} />}
                                title="Approval Response"
                                description="Receive an update when a client approves or requests changes."
                                checked={preferences.approvalResponded}
                                onCheckedChange={() => handleToggle('approvalResponded')}
                            />
                            <PreferenceToggle
                                icon={<Eye className="text-blue-400" size={18} />}
                                title="Portal Visits"
                                description="Daily digest of unique portal views from your clients."
                                checked={preferences.portalVisited}
                                onCheckedChange={() => handleToggle('portalVisited')}
                            />
                            <PreferenceToggle
                                icon={<Clock className="text-red-400" size={18} />}
                                title="Overdue Reminders"
                                description="Automatically send friendly reminders to clients for late payments."
                                checked={preferences.overdueReminders}
                                onCheckedChange={() => handleToggle('overdueReminders')}
                            />
                        </div>

                        <div className="mt-10 pt-8 border-t border-white/5 flex justify-end">
                            <GlassButton
                                onClick={handleSave}
                                loading={loading}
                                theme="indigo"
                                icon={<Save size={18} />}
                            >
                                Save Changes
                            </GlassButton>
                        </div>
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}

function PreferenceToggle({ icon, title, description, checked, onCheckedChange }: any) {
    return (
        <div className="flex items-center justify-between gap-6 p-4 rounded-2xl hover:bg-white/[0.02] transition-colors group">
            <div className="flex gap-4">
                <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-indigo-500/20 transition-colors">
                    {icon}
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-black text-white">{title}</p>
                    <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">{description}</p>
                </div>
            </div>
            <Switch checked={checked} onCheckedChange={onCheckedChange} />
        </div>
    );
}
