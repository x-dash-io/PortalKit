'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const projectSchema = z.object({
    clientName: z.string().min(1, 'Client name is required'),
    clientEmail: z.string().email('Invalid client email'),
    title: z.string().min(1, 'Project title is required'),
    description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface NewProjectModalProps {
    onSuccess?: () => void;
}

export function NewProjectModal({ onSuccess }: NewProjectModalProps) {
    const [open, setOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<ProjectFormValues>({
        resolver: zodResolver(projectSchema),
        defaultValues: {
            clientName: '',
            clientEmail: '',
            title: '',
            description: '',
        },
    });

    const onSubmit = async (data: ProjectFormValues) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to create project');
            }

            toast.success('Project created successfully!');
            setOpen(false);
            form.reset();
            router.refresh();
            if (onSuccess) onSuccess();
        } catch (error: unknown) {
            toast.error(error instanceof Error ? error.message : 'Could not create project');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="h-11 gap-2 rounded-2xl px-6">
                    <Plus size={18} />
                    <span>New Project</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] rounded-[2rem] border-[var(--border-subtle)] bg-[var(--surface)] p-0 shadow-[var(--shadow-soft)]">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-semibold tracking-tight">Launch new project</DialogTitle>
                    <DialogDescription className="text-[var(--text-secondary)]">
                        Create a workspace with files, approvals, invoices, and a dedicated client portal.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-6 pb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="clientName">Client Name</Label>
                            <Input
                                id="clientName"
                                placeholder="Acme Corp"
                                disabled={isLoading}
                                {...form.register('clientName')}
                            />
                            {form.formState.errors.clientName && (
                                <p className="text-xs text-red-400">{form.formState.errors.clientName.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="clientEmail">Client Email</Label>
                            <Input
                                id="clientEmail"
                                type="email"
                                placeholder="client@example.com"
                                disabled={isLoading}
                                {...form.register('clientEmail')}
                            />
                            {form.formState.errors.clientEmail && (
                                <p className="text-xs text-red-400">{form.formState.errors.clientEmail.message}</p>
                            )}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="title">Project Title</Label>
                        <Input
                            id="title"
                            placeholder="E-commerce Redesign"
                            disabled={isLoading}
                            {...form.register('title')}
                        />
                        {form.formState.errors.title && (
                            <p className="text-xs text-red-400">{form.formState.errors.title.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                            id="description"
                            placeholder="Key project goals and context..."
                            className="h-32 resize-none"
                            disabled={isLoading}
                            {...form.register('description')}
                        />
                    </div>
                    <DialogFooter className="pt-4">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Creating...' : 'Create Project'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
