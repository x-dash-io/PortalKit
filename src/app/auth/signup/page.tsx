'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowRight, Loader2, Lock, Mail, UserCircle2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});
type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: data.name, email: data.email, password: data.password }),
      });
      if (!response.ok) {
        const body = await response.json();
        toast.error(body.error || 'Registration failed');
        return;
      }
      toast.success('Account created! Signing you in…');
      router.push('/auth/login');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="rounded-2xl p-7"
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-modal)',
      }}
    >
      <div className="mb-6">
        <h2 className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>Create account</h2>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Start your workspace in seconds</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Full Name
          </Label>
          <div className="relative">
            <UserCircle2 size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <Input
              {...register('name')}
              placeholder="Your Name"
              className="input-base pl-9 h-10 text-sm"
            />
          </div>
          {errors.name && <p className="text-xs font-medium" style={{ color: 'var(--destructive)' }}>{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Email
          </Label>
          <div className="relative">
            <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <Input
              {...register('email')}
              type="email"
              placeholder="you@studio.com"
              className="input-base pl-9 h-10 text-sm"
            />
          </div>
          {errors.email && <p className="text-xs font-medium" style={{ color: 'var(--destructive)' }}>{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Password
          </Label>
          <div className="relative">
            <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <Input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Min. 6 characters"
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
          {errors.password && <p className="text-xs font-medium" style={{ color: 'var(--destructive)' }}>{errors.password.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
            Confirm Password
          </Label>
          <div className="relative">
            <Lock size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <Input
              {...register('confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Repeat password"
              className="input-base pl-9 h-10 text-sm"
            />
          </div>
          {errors.confirmPassword && <p className="text-xs font-medium" style={{ color: 'var(--destructive)' }}>{errors.confirmPassword.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-150 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{
            background: 'var(--accent)',
            color: 'var(--primary-foreground)',
            boxShadow: isLoading ? 'none' : 'var(--glow-sm)',
          }}
        >
          {isLoading ? (
            <><Loader2 size={14} className="animate-spin" />Creating account…</>
          ) : (
            <>Create account <ArrowRight size={14} /></>
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        Already have an account?{' '}
        <Link href="/auth/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>
          Sign in
        </Link>
      </p>
    </div>
  );
}
