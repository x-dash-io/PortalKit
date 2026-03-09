'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileIcon, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

// Glass Components
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassBadge } from '@/components/glass/GlassBadge';

interface FileUploaderProps {
    projectId: string;
    onComplete: () => void;
    folder?: string;
}

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'confirming' | 'completed' | 'error';
    error?: string;
}

export function FileUploader({ projectId, onComplete, folder = 'Root' }: FileUploaderProps) {
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);

    const uploadFile = async (uFile: UploadingFile) => {
        try {
            const presignRes = await fetch('/api/uploads/presign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    projectId,
                    filename: uFile.file.name,
                    mimeType: uFile.file.type,
                    size: uFile.file.size,
                    folder,
                }),
            });

            if (!presignRes.ok) {
                const err = await presignRes.json();
                throw new Error(err.message || 'Presign failed');
            }

            const { uploadUrl, fileId } = await presignRes.json();

            setUploadingFiles((prev) =>
                prev.map((f) => (f.id === uFile.id ? { ...f, status: 'uploading' } : f))
            );

            await new Promise<void>((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', uFile.file.type);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const progress = (event.loaded / event.total) * 100;
                        setUploadingFiles((prev) =>
                            prev.map((f) => (f.id === uFile.id ? { ...f, progress } : f))
                        );
                    }
                };

                xhr.onload = () => {
                    if (xhr.status === 200) resolve();
                    else reject(new Error('Upload failed'));
                };

                xhr.onerror = () => reject(new Error('Network error during upload'));
                xhr.send(uFile.file);
            });

            setUploadingFiles((prev) =>
                prev.map((f) => (f.id === uFile.id ? { ...f, status: 'confirming' } : f))
            );

            const confirmRes = await fetch(`/api/projects/${projectId}/files/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId }),
            });

            if (!confirmRes.ok) throw new Error('Confirmation failed');

            setUploadingFiles((prev) =>
                prev.map((f) => (f.id === uFile.id ? { ...f, status: 'completed', progress: 100 } : f))
            );

            toast.success(`${uFile.file.name} uploaded successfully`);
            onComplete();

            setTimeout(() => {
                setUploadingFiles((prev) => prev.filter((f) => f.id !== uFile.id));
            }, 3000);
        } catch (error: unknown) {
            console.error(error);
            const message = error instanceof Error ? error.message : 'Upload failed';
            setUploadingFiles((prev) =>
                prev.map((f) => (f.id === uFile.id ? { ...f, status: 'error', error: message } : f))
            );
            toast.error(`Upload failed: ${uFile.file.name}`);
        }
    };

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            const newFiles = acceptedFiles.map((file) => ({
                id: Math.random().toString(36).substring(7),
                file,
                progress: 0,
                status: 'pending' as const,
            }));

            setUploadingFiles((prev) => [...prev, ...newFiles]);
            newFiles.forEach(uploadFile);
        },
        [projectId, folder]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: 524288000,
    });

    return (
        <div className="space-y-8 w-full">
            <div
                {...getRootProps()}
                className={cn(
                    "relative group h-64 border-2 border-dashed rounded-[2.5rem] transition-all duration-500 flex flex-col items-center justify-center cursor-pointer overflow-hidden",
                    isDragActive
                        ? "border-indigo-500 bg-indigo-500/10 scale-[0.98]"
                        : "border-white/10 hover:border-indigo-500/40 hover:bg-white/[0.02]"
                )}
            >
                <input {...getInputProps()} />

                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <div className={cn(
                        "h-20 w-20 rounded-3xl bg-white/5 flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:bg-indigo-500/10",
                        isDragActive && "scale-110 bg-indigo-500/20"
                    )}>
                        <Upload size={36} className={cn(
                            "text-white/20 transition-all duration-500 group-hover:text-indigo-400",
                            isDragActive && "text-indigo-400 animate-bounce"
                        )} />
                    </div>
                    <div className="text-center">
                        <p className="text-xl font-black text-white tracking-tight">Drop your assets here</p>
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2">
                            Max size 500MB per file
                        </p>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {uploadingFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Active Status</h4>
                            <GlassBadge variant="indigo" className="px-3 h-5">{uploadingFiles.length} Queueing</GlassBadge>
                        </div>
                        <div className="space-y-3">
                            {uploadingFiles.map((uf) => (
                                <GlassCard key={uf.id} className="p-4 border-white/5 transition-all duration-500">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4 truncate">
                                            <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                                <FileIcon size={18} className="text-indigo-400" />
                                            </div>
                                            <div className="truncate">
                                                <p className="text-sm font-black text-white truncate">{uf.file.name}</p>
                                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                                    {uf.status === 'uploading' ? 'Transmitting...' : uf.status === 'confirming' ? 'Verifying...' : uf.status === 'completed' ? 'Finalized' : 'Error'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            {uf.status === 'completed' ? (
                                                <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                                                    <CheckCircle2 size={18} />
                                                </div>
                                            ) : uf.status === 'error' ? (
                                                <div className="h-8 w-8 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                                                    <X size={18} />
                                                </div>
                                            ) : (
                                                <span className="text-xs font-black text-white">{Math.round(uf.progress)}%</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${uf.progress}%` }}
                                            className={cn(
                                                "h-full transition-all duration-300",
                                                uf.status === 'error' ? "bg-red-500" : "bg-indigo-500"
                                            )}
                                        />
                                    </div>

                                    {uf.status === 'error' && (
                                        <p className="text-[10px] text-red-400 font-bold mt-2 ml-1">Error: {uf.error}</p>
                                    )}
                                </GlassCard>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
