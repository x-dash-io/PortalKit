'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowRight, Loader2, Lock, Mail, Eye, EyeOff, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email:    z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading,     setIsLoading]     = useState(false);
  const [showPassword,  setShowPassword]  = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', { email: data.email, password: data.password, redirect: false });
      if (result?.error) { toast.error(result.error); return; }
      toast.success('Welcome back!');
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('Could not sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-scale-in">
      {/* Mobile logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl text-white" style={{ background: 'var(--accent-gradient)', boxShadow: 'var(--glow-sm)' }}>
          <Zap size={14} strokeWidth={2.5} />
        </span>
        <span className="text-sm font-black" style={{ color: 'var(--text-primary)' }}>PortalKit</span>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: 'var(--surface)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-modal)' }}
      >
        <div className="h-1" style={{ background: 'var(--accent-gradient)' }} />
        <div className="p-7">
          <div className="mb-6">
            <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Sign in</h2>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Welcome back to your workspace</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Email
              </Label>
              <div className="relative">
                <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <Input {...register('email')} type="email" placeholder="you@studio.com" className="input-base pl-9 h-10 text-sm" />
              </div>
              {errors.email && <p className="text-xs" style={{ color: 'var(--destructive)' }}>{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Password
              </Label>
              <div className="relative">
                <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                <Input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-base pl-9 pr-9 h-10 text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors hover:text-[var(--text-primary)]"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                </button>
              </div>
              {errors.password && <p className="text-xs" style={{ color: 'var(--destructive)' }}>{errors.password.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background: 'var(--accent-gradient)',
                color: 'var(--primary-foreground)',
                boxShadow: isLoading ? 'none' : 'var(--glow-sm)',
              }}
            >
              {isLoading ? (
                <><Loader2 size={14} className="spin-slow" />Signing in…</>
              ) : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="mt-5 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-bold hover:underline" style={{ color: 'var(--accent)' }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
