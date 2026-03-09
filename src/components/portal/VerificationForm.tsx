'use client';

import React, { useState } from 'react';
import { ShieldCheck, ArrowRight, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface VerificationFormProps {
    token: string;
}

export function VerificationForm({ token }: VerificationFormProps) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/portal/${token}/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || 'Verification failed');
            }

            toast.success('Access granted');
            window.location.href = `/portal/${token}`;
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="text-center space-y-4">
                <div
                    className="h-20 w-20 rounded-3xl mx-auto flex items-center justify-center mb-8"
                    style={{ background: 'var(--accent)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow)' }}
                >
                    <ShieldCheck size={40} />
                </div>
                <h1 className="text-4xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Secure Access</h1>
                <p style={{ color: 'var(--text-muted)' }}>Please verify your email address to access this project portal.</p>
            </div>

            <form onSubmit={handleSubmit} className="glass-card p-8 space-y-6" style={{ borderColor: 'var(--border-medium)' }}>
                <div className="space-y-3">
                    <label className="text-xs font-black uppercase tracking-widest text-[var(--text-muted)]">Email Address</label>
                    <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                        <Input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="glass-input h-14 pl-12 focus-visible:ring-indigo-500 text-lg"
                        />
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 rounded-2xl font-black text-lg gap-2 transition-all active:scale-95"
                    style={{ background: 'var(--accent)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow-sm)' }}
                >
                    {loading ? 'Verifying...' : 'Access Portal'}
                    <ArrowRight size={20} />
                </Button>
            </form>

            <p className="text-center text-xs text-[var(--text-muted)]">
                This link is private. If you&apos;re having trouble, please contact your freelancer.
            </p>
        </div>
    );
}
