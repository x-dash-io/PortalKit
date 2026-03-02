'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import Link from 'next/link';

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
            } else {
                toast.success('Successfully logged in!');
                router.push('/dashboard');
                router.refresh();
            }
        } catch (error) {
            toast.error('Something went wrong. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        signIn('google', { callbackUrl: '/dashboard' });
    };

    return (
        <div className="flex items-center justify-center min-height-[100vh] p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                <Card className="glass-card">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold text-center">Login</CardTitle>
                        <CardDescription className="text-center">
                            Enter your credentials to access your dashboard
                        </CardDescription>
                    </CardHeader>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="name@example.com"
                                    className="glass-input"
                                    disabled={isLoading}
                                    {...form.register('email')}
                                />
                                {form.formState.errors.email && (
                                    <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className="glass-input"
                                    disabled={isLoading}
                                    {...form.register('password')}
                                />
                                {form.formState.errors.password && (
                                    <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col space-y-4">
                            <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isLoading}>
                                {isLoading ? 'Logging in...' : 'Login'}
                            </Button>
                            <div className="relative w-full">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-[var(--border-glass)]" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-[var(--bg-glass)] px-2 text-[var(--text-muted)]">Or continue with</span>
                                </div>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                className="w-full glass-card hover:bg-white/10"
                                onClick={handleGoogleLogin}
                                disabled={isLoading}
                            >
                                Google
                            </Button>
                            <p className="text-center text-sm text-[var(--text-secondary)]">
                                Don&apos;t have an account?{' '}
                                <Link href="/auth/signup" className="text-indigo-400 hover:underline">
                                    Sign up
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </motion.div>
        </div>
    );
}
