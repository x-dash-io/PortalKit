'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success('Signed in');
      router.push('/dashboard');
      router.refresh();
    } catch {
      toast.error('Could not sign in');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden rounded-[2.25rem] border border-slate-200/80 bg-[color-mix(in_srgb,var(--surface)_94%,white)] p-0 shadow-[0_30px_80px_rgba(15,23,42,0.12)]">
      <CardHeader className="space-y-3 border-b border-slate-200/70 px-8 py-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[var(--text-muted)]">Access workspace</p>
        <CardTitle className="text-4xl font-semibold tracking-tight text-[var(--text-primary)]">Sign in</CardTitle>
        <CardDescription className="max-w-md text-base leading-relaxed text-[var(--text-secondary)]">
          Open your delivery workspace, review project activity, and manage client-facing operations.
        </CardDescription>
      </CardHeader>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <CardContent className="space-y-5 px-8 py-8">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <Input id="email" type="email" className="h-[52px] rounded-2xl border-slate-200 pl-11" {...form.register('email')} />
            </div>
            {form.formState.errors.email && <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>}
          </div>

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
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-slate-200/70 px-8 py-8">
          <Button
            type="submit"
            size="lg"
            className="h-[52px] w-full rounded-2xl bg-[var(--accent)] text-white shadow-[0_24px_50px_rgba(15,118,110,0.22)] hover:bg-[var(--accent-hover)]"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
            {!isLoading && <ArrowRight size={16} />}
          </Button>
          <p className="text-center text-sm text-[var(--text-secondary)]">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="font-semibold text-[var(--accent)] hover:underline">
              Create one
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
