'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

const projectSchema = z.object({
  clientName:  z.string().min(1, 'Client name is required'),
  clientEmail: z.string().email('Invalid client email'),
  title:       z.string().min(1, 'Project title is required'),
  description: z.string().optional(),
});
type ProjectFormValues = z.infer<typeof projectSchema>;

interface NewProjectModalProps { onSuccess?: () => void; }

export function NewProjectModal({ onSuccess }: NewProjectModalProps) {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: { clientName: '', clientEmail: '', title: '', description: '' },
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
      toast.success('Project created!');
      setOpen(false);
      form.reset();
      router.refresh();
      onSuccess?.();
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Could not create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: 'var(--accent)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow-sm)' }}
      >
        <Plus size={15} strokeWidth={2.5} />
        New Project
      </button>

      <DialogContent
        className="sm:max-w-[520px] rounded-2xl border-0 p-0 overflow-hidden"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        {/* Accent top strip */}
        <div className="h-1 w-full" style={{ background: 'var(--accent-gradient)' }} />

        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Launch new project
          </DialogTitle>
          <DialogDescription className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Create a workspace with files, approvals, invoices, and a dedicated client portal.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Client Name
              </Label>
              <Input
                placeholder="Acme Corp"
                disabled={isLoading}
                className="input-base h-10 text-sm"
                {...form.register('clientName')}
              />
              {form.formState.errors.clientName && (
                <p className="text-xs font-medium" style={{ color: 'var(--destructive)' }}>
                  {form.formState.errors.clientName.message}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Client Email
              </Label>
              <Input
                type="email"
                placeholder="client@example.com"
                disabled={isLoading}
                className="input-base h-10 text-sm"
                {...form.register('clientEmail')}
              />
              {form.formState.errors.clientEmail && (
                <p className="text-xs font-medium" style={{ color: 'var(--destructive)' }}>
                  {form.formState.errors.clientEmail.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Project Title
            </Label>
            <Input
              placeholder="E-commerce Redesign"
              disabled={isLoading}
              className="input-base h-10 text-sm"
              {...form.register('title')}
            />
            {form.formState.errors.title && (
              <p className="text-xs font-medium" style={{ color: 'var(--destructive)' }}>
                {form.formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Description{' '}
              <span className="normal-case tracking-normal font-normal" style={{ color: 'var(--text-muted)' }}>
                (optional)
              </span>
            </Label>
            <Textarea
              placeholder="Key goals and context for this project…"
              className="input-base resize-none text-sm"
              style={{ minHeight: 88 }}
              disabled={isLoading}
              {...form.register('description')}
            />
          </div>

          <div
            className="flex gap-2.5 pt-2 border-t"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className="flex-1 h-10 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background: 'var(--surface-muted)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-10 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{
                background: 'var(--accent)',
                color: 'var(--primary-foreground)',
                boxShadow: isLoading ? 'none' : 'var(--glow-sm)',
              }}
            >
              {isLoading ? (
                <><Loader2 size={13} className="animate-spin" />Creating…</>
              ) : (
                'Create Project'
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
