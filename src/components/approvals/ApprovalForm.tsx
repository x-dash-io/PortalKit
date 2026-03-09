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
import { Send, Loader2 } from 'lucide-react';
import type { FileListResponse, FileRecord } from '@/lib/contracts';

// Glass Components
import { GlassModal } from '@/components/glass/GlassModal';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassButton } from '@/components/glass/GlassButton';
import { toast } from 'sonner';

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
    const [files, setFiles] = useState<FileRecord[]>([]);

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, projectId]);

    const fetchFiles = async () => {
        try {
            const res = await fetch(`/api/projects/${projectId}/files`);
            if (res.ok) {
                const data = (await res.json()) as FileListResponse;
                setFiles(data.items);
            }
        } catch {
            setFiles([]);
        }
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
        } catch {
            toast.error('Error sending approval request');
        }
    };

    return (
        <GlassModal isOpen={isOpen} onClose={onClose} title="Request Client Approval">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <GlassInput
                    label="Request Title"
                    placeholder="e.g., V1 Brand Strategy Deck"
                    {...register('title')}
                    error={errors.title?.message}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Asset Category</label>
                        <Select
                            onValueChange={(val) => setValue('type', val as ApprovalFormValues['type'])}
                            defaultValue="file"
                        >
                            <SelectTrigger className="h-10 rounded-xl">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="file">File Asset</SelectItem>
                                <SelectItem value="milestone">Milestone</SelectItem>
                                <SelectItem value="design">Design Mockup</SelectItem>
                                <SelectItem value="copy">Copy/Content</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Reference File</label>
                        <Select onValueChange={(val) => setValue('fileId', val)}>
                            <SelectTrigger className="h-10 rounded-xl">
                                <SelectValue placeholder="Link asset..." />
                            </SelectTrigger>
                            <SelectContent>
                                {files.map(f => (
                                    <SelectItem key={f._id} value={f._id}>
                                        {f.originalName}
                                    </SelectItem>
                                ))}
                                {files.length === 0 && <p className="p-3 text-xs italic" style={{ color: 'var(--text-muted)' }}>No files found</p>}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-[0.2em] ml-1">Request Details</label>
                    <textarea
                        placeholder="Provide context for the client..."
                        {...register('description')}
                        className="w-full h-28 rounded-xl p-4 text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 transition-all resize-none"
                        style={{
                            background: 'var(--input)',
                            border: '1.5px solid var(--border-medium)',
                            color: 'var(--text-primary)',
                        }}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <GlassButton variant="secondary" onClick={onClose} type="button" className="flex-1 h-11 rounded-xl">
                        Discard
                    </GlassButton>
                    <GlassButton
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-[2] h-11 rounded-xl"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <><Send size={16} className="mr-1.5" /> Send Request</>}
                    </GlassButton>
                </div>
            </form>
        </GlassModal>
    );
}
