'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, FileQuestion, Loader2, UploadCloud } from 'lucide-react';
import bytes from 'bytes';
import { toast } from 'sonner';
import type { FileRecord } from '@/lib/contracts';

interface FilePreviewProps {
    file: FileRecord | null;
    projectId: string;
    onClose: () => void;
    onVersionUploaded?: () => void;
}

export function FilePreview({ file, projectId, onClose, onVersionUploaded }: FilePreviewProps) {
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [uploadingVersion, setUploadingVersion] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!file) {
            setDownloadUrl(null);
            return;
        }

        let cancelled = false;

        const getDownloadUrl = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/projects/${projectId}/files/${file._id}/download`);
                if (!res.ok) throw new Error('Failed to get preview URL');
                const data = await res.json();
                if (!cancelled) {
                    setDownloadUrl(data.downloadUrl);
                }
            } catch {
                toast.error('Could not load preview');
                onClose();
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        void getDownloadUrl();

        return () => {
            cancelled = true;
        };
    }, [file, onClose, projectId]);

    if (!file) return null;

    const isImage = file.mimeType.startsWith('image/');
    const isPDF = file.mimeType === 'application/pdf';
    const isVideo = file.mimeType.startsWith('video/');

    const handleVersionUpload = async (nextFile: File | undefined) => {
        if (!nextFile || !file) return;

        setUploadingVersion(true);
        try {
            const versionResponse = await fetch(`/api/projects/${projectId}/files/${file._id}/version`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    filename: nextFile.name,
                    mimeType: nextFile.type,
                    size: nextFile.size,
                }),
            });

            if (!versionResponse.ok) throw new Error('Failed to prepare version upload');

            const { uploadUrl } = (await versionResponse.json()) as { uploadUrl: string };
            const uploadResult = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': nextFile.type,
                },
                body: nextFile,
            });

            if (!uploadResult.ok) throw new Error('Upload failed');

            const confirmResponse = await fetch(`/api/projects/${projectId}/files/confirm`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ fileId: file._id }),
            });

            if (!confirmResponse.ok) throw new Error('Failed to activate new version');

            toast.success('New file version uploaded');
            onVersionUploaded?.();
        } catch {
            toast.error('Could not upload a new version');
        } finally {
            setUploadingVersion(false);
            if (inputRef.current) {
                inputRef.current.value = '';
            }
        }
    };

    return (
        <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="glass-card max-w-4xl w-[90vw] h-[80vh] flex flex-col p-0 border-white/10 backdrop-blur-3xl overflow-hidden">
                <DialogHeader className="p-6 border-b border-white/5 flex flex-row items-center justify-between shrink-0">
                    <div>
                        <DialogTitle className="text-xl font-bold truncate max-w-md">{file.name}</DialogTitle>
                        <p className="text-xs text-[var(--text-muted)] mt-1">
                            {file.mimeType} • {bytes(file.size)}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 pr-8">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 hover:bg-white/10"
                            onClick={() => downloadUrl && window.open(downloadUrl, '_blank')}
                        >
                            <Download size={16} />
                            Download
                        </Button>
                        <input
                            ref={inputRef}
                            type="file"
                            className="hidden"
                            onChange={(event) => void handleVersionUpload(event.target.files?.[0])}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="gap-2 hover:bg-white/10"
                            disabled={uploadingVersion}
                            onClick={() => inputRef.current?.click()}
                        >
                            {uploadingVersion ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud size={16} />}
                            New Version
                        </Button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-auto bg-black/20 flex items-center justify-center p-4">
                    {loading ? (
                        <div className="flex flex-col items-center gap-3">
                            <Loader2 className="animate-spin text-indigo-400" size={32} />
                            <p className="text-sm text-[var(--text-muted)]">Loading preview...</p>
                        </div>
                    ) : downloadUrl ? (
                        <>
                            {isImage && (
                                <img
                                    src={downloadUrl}
                                    alt={file.originalName}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                />
                            )}
                            {isPDF && (
                                <iframe
                                    src={`${downloadUrl}#toolbar=0`}
                                    className="w-full h-full rounded-lg bg-white"
                                    title={file.originalName}
                                />
                            )}
                            {isVideo && (
                                <video
                                    src={downloadUrl}
                                    controls
                                    autoPlay
                                    className="max-w-full max-h-full rounded-lg shadow-2xl"
                                />
                            )}
                            {!isImage && !isPDF && !isVideo && (
                                <div className="text-center p-12 bg-white/5 rounded-3xl border border-white/5 max-w-sm">
                                    <div className="bg-white/5 p-6 rounded-full w-fit mx-auto mb-4">
                                        <FileQuestion size={48} className="text-[var(--text-muted)]" />
                                    </div>
                                    <h3 className="text-lg font-bold mb-2">Preview unavailable</h3>
                                    <p className="text-sm text-[var(--text-secondary)] mb-6">
                                        We don&apos;t support in-browser preview for this file type yet.
                                    </p>
                                    <Button
                                        className="bg-indigo-600 hover:bg-indigo-700 w-full"
                                        onClick={() => window.open(downloadUrl, '_blank')}
                                    >
                                        Download File
                                    </Button>
                                </div>
                            )}
                        </>
                    ) : null}
                </div>

                <div className="border-t border-white/5 px-6 py-4 text-xs text-[var(--text-muted)]">
                    {file.versions.length > 0 ? `${file.versions.length} archived version(s) available on this asset.` : 'No prior versions yet.'}
                </div>
            </DialogContent>
        </Dialog>
    );
}
