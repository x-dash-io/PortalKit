'use client';

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, FileQuestion, Loader2 } from 'lucide-react';
import bytes from 'bytes';
import { toast } from 'sonner';

interface FileDoc {
    _id: string;
    name: string;
    mimeType: string;
    size: number;
}

interface FilePreviewProps {
    file: FileDoc | null;
    projectId: string;
    onClose: () => void;
}

export function FilePreview({ file, projectId, onClose }: FilePreviewProps) {
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (file) {
            getDownloadUrl();
        } else {
            setDownloadUrl(null);
        }
    }, [file]);

    const getDownloadUrl = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/files/${file._id}/download`);
            if (!res.ok) throw new Error('Failed to get preview URL');
            const data = await res.json();
            setDownloadUrl(data.downloadUrl);
        } catch (error) {
            toast.error('Could not load preview');
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!file) return null;

    const isImage = file.mimeType.startsWith('image/');
    const isPDF = file.mimeType === 'application/pdf';
    const isVideo = file.mimeType.startsWith('video/');

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
                                    alt={file.name}
                                    className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                                />
                            )}
                            {isPDF && (
                                <iframe
                                    src={`${downloadUrl}#toolbar=0`}
                                    className="w-full h-full rounded-lg bg-white"
                                    title={file.name}
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
            </DialogContent>
        </Dialog>
    );
}
