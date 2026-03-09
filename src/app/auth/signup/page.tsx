'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowRight, Lock, Mail, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Could not create account');

      toast.success('Account created');
      router.push('/auth/login');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Could not create account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-[color-mix(in_srgb,var(--surface)_95%,white)] p-0 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
      <CardHeader className="space-y-3 border-b border-slate-200/70 px-8 py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Launch workspace</p>
        <CardTitle className="text-4xl font-semibold tracking-tight text-[var(--text-primary)]">Create your workspace</CardTitle>
        <CardDescription className="max-w-md text-base leading-relaxed text-[var(--text-secondary)]">
          Launch a client portal, delivery workflow, and billing layer in one account.
        </CardDescription>
      </CardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 px-8 py-8">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <div className="relative">
              <UserCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <Input id="name" className="h-[52px] rounded-2xl border-slate-200 pl-11" {...form.register('name')} />
            </div>
            {form.formState.errors.name && <p className="text-sm text-red-600">{form.formState.errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <Input id="email" type="email" className="h-[52px] rounded-2xl border-slate-200 pl-11" {...form.register('email')} />
            </div>
            {form.formState.errors.email && <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>}
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                <Input id="password" type="password" className="h-[52px] rounded-2xl border-slate-200 pl-11" {...form.register('password')} />
              </div>
              {form.formState.errors.password && (
                <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                <Input
                  id="confirmPassword"
                  type="password"
                  className="h-[52px] rounded-2xl border-slate-200 pl-11"
                  {...form.register('confirmPassword')}
                />
              </div>
              {form.formState.errors.confirmPassword && (
                <p className="text-sm text-red-600">{form.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-slate-200/70 px-8 py-8">
          <Button
            type="submit"
            size="lg"
            className="h-[52px] w-full rounded-2xl bg-[var(--accent)] text-white shadow-[0_24px_50px_rgba(15,118,110,0.22)] hover:bg-[var(--accent-hover)]"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
            {!isLoading && <ArrowRight size={16} />}
          </Button>
          <p className="text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-semibold text-[var(--accent)] hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
