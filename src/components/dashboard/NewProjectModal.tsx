'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plus, Loader2, FolderKanban } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
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

export function NewProjectModal({ onSuccess }: { onSuccess?: () => void }) {
  const [open,      setOpen]      = useState(false);
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
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all hover:opacity-90 active:scale-[0.98]"
        style={{ background: 'var(--accent-gradient)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow-sm)' }}
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
        {/* Accent strip */}
        <div className="h-1 w-full" style={{ background: 'var(--accent-gradient)' }} />

        <DialogHeader className="px-6 pt-6 pb-0">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
            >
              <FolderKanban size={18} />
            </div>
            <div>
              <DialogTitle className="text-lg font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>
                New Project
              </DialogTitle>
              <DialogDescription className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Create a workspace with files, approvals, invoices, and a client portal.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 pb-6 pt-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Client Name
              </Label>
              <Input
                {...form.register('clientName')}
                placeholder="Aria Chen"
                className="input-base h-10 text-sm"
              />
              {form.formState.errors.clientName && (
                <p className="text-xs" style={{ color: 'var(--destructive)' }}>{form.formState.errors.clientName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
                Client Email
              </Label>
              <Input
                {...form.register('clientEmail')}
                type="email"
                placeholder="aria@studio.io"
                className="input-base h-10 text-sm"
              />
              {form.formState.errors.clientEmail && (
                <p className="text-xs" style={{ color: 'var(--destructive)' }}>{form.formState.errors.clientEmail.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Project Title
            </Label>
            <Input
              {...form.register('title')}
              placeholder="Brand Identity Suite Q1"
              className="input-base h-10 text-sm"
            />
            {form.formState.errors.title && (
              <p className="text-xs" style={{ color: 'var(--destructive)' }}>{form.formState.errors.title.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              Description <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
            </Label>
            <Textarea
              {...form.register('description')}
              placeholder="Scope, deliverables, or any context for this project…"
              className="input-base text-sm resize-none"
              rows={3}
            />
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: 'var(--border-subtle)' }} />

          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-colors"
              style={{ color: 'var(--text-secondary)', background: 'var(--surface-muted)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: 'var(--accent-gradient)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow-sm)' }}
            >
              {isLoading ? (
                <><Loader2 size={14} className="spin-slow" /> Creating…</>
              ) : (
                <><Plus size={14} /> Create Project</>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
