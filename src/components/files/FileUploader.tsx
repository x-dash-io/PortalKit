'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileIcon, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import bytes from 'bytes';

interface UploadFile {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'done' | 'error';
    error?: string;
}

interface FileUploaderProps {
    projectId: string;
    onComplete?: () => void;
}

export function FileUploader({ projectId, onComplete }: FileUploaderProps) {
    const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);

    const uploadFile = async (uf: UploadFile) => {
        setUploadFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'uploading' } : f));

        try {
            // Get presigned URL
            const presignRes = await fetch('/api/uploads/presign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: uf.file.name,
                    contentType: uf.file.type,
                    projectId,
                }),
            });
            if (!presignRes.ok) throw new Error('Could not get upload URL');
            const { uploadUrl, key, fileId } = await presignRes.json();

            // Upload to R2
            const xhr = new XMLHttpRequest();
            await new Promise<void>((resolve, reject) => {
                xhr.upload.addEventListener('progress', (e) => {
                    if (e.lengthComputable) {
                        const progress = Math.round((e.loaded / e.total) * 90);
                        setUploadFiles(prev => prev.map(f => f.id === uf.id ? { ...f, progress } : f));
                    }
                });
                xhr.addEventListener('load', () => xhr.status < 300 ? resolve() : reject(new Error(`Upload failed: ${xhr.status}`)));
                xhr.addEventListener('error', () => reject(new Error('Upload failed')));
                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', uf.file.type);
                xhr.send(uf.file);
            });

            // Confirm upload
            const confirmRes = await fetch(`/api/projects/${projectId}/files/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId, key, name: uf.file.name, size: uf.file.size, mimeType: uf.file.type }),
            });
            if (!confirmRes.ok) throw new Error('Could not confirm upload');

            setUploadFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'done', progress: 100 } : f));
            onComplete?.();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Upload failed';
            setUploadFiles(prev => prev.map(f => f.id === uf.id ? { ...f, status: 'error', error: msg } : f));
        }
    };

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newFiles: UploadFile[] = acceptedFiles.map(file => ({
            id: `${file.name}-${Date.now()}-${Math.random()}`,
            file,
            progress: 0,
            status: 'pending',
        }));
        setUploadFiles(prev => [...prev, ...newFiles]);
        newFiles.forEach(uf => void uploadFile(uf));
    }, [projectId]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxSize: 500 * 1024 * 1024,
    });

    const active = uploadFiles.filter(f => f.status !== 'done');

    return (
        <div className="space-y-6">
            <div
                {...getRootProps()}
                className={cn(
                    'flex flex-col items-center gap-5 rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300',
                )}
                style={{
                    borderColor: isDragActive ? 'var(--accent)' : 'var(--border-medium)',
                    background: isDragActive ? 'var(--accent-light)' : 'var(--surface-muted)',
                }}
            >
                <input {...getInputProps()} />
                <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center transition-all duration-300"
                    style={{
                        background: isDragActive ? 'var(--accent)' : 'var(--surface)',
                        color: isDragActive ? 'var(--primary-foreground)' : 'var(--text-muted)',
                    }}
                >
                    <UploadCloud size={28} />
                </div>
                <div>
                    <p className="text-base font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {isDragActive ? 'Drop files here' : 'Drop files or click to upload'}
                    </p>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                        Up to 500MB per file
                    </p>
                </div>
            </div>

            {active.length > 0 && (
                <div className="space-y-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        Uploading
                    </p>
                    {active.map((uf) => (
                        <div
                            key={uf.id}
                            className="flex items-center gap-4 p-4 rounded-xl"
                            style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}
                        >
                            <div
                                className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
                                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                            >
                                <FileIcon size={18} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-2">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                                        {uf.file.name}
                                    </p>
                                    <div className="flex items-center gap-2 shrink-0 ml-2">
                                        {uf.status === 'uploading' && (
                                            <>
                                                <Loader2 size={14} className="animate-spin" style={{ color: 'var(--accent)' }} />
                                                <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                                                    {uf.progress}%
                                                </span>
                                            </>
                                        )}
                                        {uf.status === 'done' && <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />}
                                        {uf.status === 'error' && <AlertCircle size={16} style={{ color: 'var(--destructive)' }} />}
                                    </div>
                                </div>
                                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text-muted)' }}>
                                    <span>{bytes(uf.file.size)}</span>
                                    {uf.error && <span style={{ color: 'var(--destructive)' }}>{uf.error}</span>}
                                </div>
                                <div className="h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{
                                            width: `${uf.progress}%`,
                                            background: uf.status === 'error' ? 'var(--destructive)' : 'var(--accent-gradient)',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
