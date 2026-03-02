'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

// Glass Components
import { GlassModal } from '@/components/glass/GlassModal';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassButton } from '@/components/glass/GlassButton';

const approvalSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    type: z.enum(['file', 'milestone', 'design', 'copy', 'other']),
    description: z.string().optional(),
    fileId: z.string().optional(),
});

type ApprovalFormValues = z.infer<typeof approvalSchema>;

interface ApprovalFormProps {
    projectId: string;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function ApprovalForm({ projectId, isOpen, onClose, onSuccess }: ApprovalFormProps) {
    const [files, setFiles] = useState<any[]>([]);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors, isSubmitting }
    } = useForm<ApprovalFormValues>({
        resolver: zodResolver(approvalSchema),
        defaultValues: {
            type: 'file',
        }
    });

    useEffect(() => {
        if (isOpen) {
            fetchFiles();
        }
    }, [isOpen, projectId]);

    const fetchFiles = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/files`);
            if (res.ok) {
                const data = await res.json();
                setFiles(data);
            }
        } catch (e) { }
    };

    const onSubmit = async (values: ApprovalFormValues) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/approvals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });

            if (!res.ok) throw new Error('Failed to create approval request');

            toast.success('Approval request sent to client');
            reset();
            onSuccess();
            onClose();
        } catch (error) {
            toast.error('Error sending approval request');
        }
    };

    return (
        <GlassModal isOpen={isOpen} onClose={onClose} title="Request Client Approval">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <GlassInput
                    label="Request Title"
                    placeholder="e.g., V1 Brand Strategy Deck"
                    {...register('title')}
                    error={errors.title?.message}
                />

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Asset Category</label>
                        <Select
                            onValueChange={(val: any) => setValue('type', val)}
                            defaultValue="file"
                        >
                            <SelectTrigger className="h-14 border-none bg-white/5 hover:bg-white/10 px-6 rounded-2xl font-bold text-sm ring-0 focus:ring-0">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-white/10 rounded-2xl p-2 shadow-2xl">
                                <SelectItem value="file" className="rounded-xl focus:bg-indigo-600/10 font-bold">File Asset</SelectItem>
                                <SelectItem value="milestone" className="rounded-xl focus:bg-indigo-600/10 font-bold">Milestone</SelectItem>
                                <SelectItem value="design" className="rounded-xl focus:bg-indigo-600/10 font-bold">Design Mockup</SelectItem>
                                <SelectItem value="copy" className="rounded-xl focus:bg-indigo-600/10 font-bold">Copy/Content</SelectItem>
                                <SelectItem value="other" className="rounded-xl focus:bg-indigo-600/10 font-bold">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Reference File</label>
                        <Select onValueChange={(val: any) => setValue('fileId', val)}>
                            <SelectTrigger className="h-14 border-none bg-white/5 hover:bg-white/10 px-6 rounded-2xl font-bold text-sm ring-0 focus:ring-0">
                                <SelectValue placeholder="Link asset..." />
                            </SelectTrigger>
                            <SelectContent className="glass-card border-white/10 rounded-2xl p-2 shadow-2xl">
                                {files.map(f => (
                                    <SelectItem key={f._id} value={f._id} className="rounded-xl focus:bg-indigo-600/10 font-bold">
                                        {f.filename}
                                    </SelectItem>
                                ))}
                                {files.length === 0 && <p className="p-4 text-xs text-[var(--text-muted)] italic text-white/40 font-bold">No files found</p>}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] ml-1">Request Details</label>
                    <textarea
                        placeholder="Provide context for the client..."
                        {...register('description')}
                        className="w-full h-32 bg-white/5 border border-white/5 rounded-2xl p-5 text-white placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium leading-relaxed"
                    />
                </div>

                <div className="flex gap-4 pt-4">
                    <GlassButton variant="secondary" onClick={onClose} type="button" className="flex-1 h-14 rounded-2xl">
                        Discard
                    </GlassButton>
                    <GlassButton
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] h-14 rounded-2xl px-12"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} className="mr-2" /> Send Request</>}
                    </GlassButton>
                </div>
            </form>
        </GlassModal>
    );
}
