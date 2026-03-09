'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    FileIcon, FileText, ImageIcon, Film, Download, Trash2,
    MoreVertical, Eye, Search, FolderOpen, Pencil, FolderInput,
    Check, X, Music, Archive, History, Upload,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import bytes from 'bytes';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import type { FileListResponse, FileRecord, FileVersionRecord } from '@/lib/contracts';
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface FileGridProps {
    projectId: string;
    refreshTrigger: number;
    onPreview?: (file: FileRecord) => void;
}

function getFileIcon(mimeType: string) {
    if (mimeType.startsWith('image/')) return <ImageIcon size={26} style={{ color: 'var(--accent)' }} />;
    if (mimeType.startsWith('video/')) return <Film size={26} style={{ color: 'var(--warning)' }} />;
    if (mimeType.startsWith('audio/')) return <Music size={26} style={{ color: 'var(--warning)' }} />;
    if (mimeType === 'application/pdf') return <FileText size={26} style={{ color: 'var(--destructive)' }} />;
    if (mimeType.includes('zip') || mimeType.includes('tar')) return <Archive size={26} style={{ color: 'var(--success)' }} />;
    return <FileIcon size={26} style={{ color: 'var(--text-muted)' }} />;
}

interface InlineEdit { fileId: string; value: string; }

export function FileGrid({ projectId, refreshTrigger, onPreview }: FileGridProps) {
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('All Files');
    const [renaming, setRenaming] = useState<InlineEdit | null>(null);
    const [moving, setMoving] = useState<InlineEdit | null>(null);
    const [versionFile, setVersionFile] = useState<FileRecord | null>(null);
    const [uploadingVersion, setUploadingVersion] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' });
    const versionInputRef = useRef<HTMLInputElement>(null);
    const renameRef = useRef<HTMLInputElement>(null);
    const moveRef = useRef<HTMLInputElement>(null);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const qs = selectedFolder !== 'All Files' ? `?folder=${encodeURIComponent(selectedFolder)}` : '';
            const res = await fetch(`/api/projects/${projectId}/files${qs}`);
            if (!res.ok) throw new Error();
            const data = (await res.json()) as FileListResponse;
            setFiles(data.items);
        } catch {
            toast.error('Could not load files');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { void fetchFiles(); }, [projectId, refreshTrigger, selectedFolder]);
    useEffect(() => { if (renaming) setTimeout(() => renameRef.current?.select(), 50); }, [renaming]);
    useEffect(() => { if (moving) setTimeout(() => moveRef.current?.select(), 50); }, [moving]);

    const handleDelete = (fileId: string, name: string) => {
        setDeleteConfirm({ open: true, id: fileId, name });
    };

    const executeDelete = async (fileId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/files/${fileId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            toast.success('File deleted');
            void fetchFiles();
        } catch {
            toast.error('Could not delete file');
        }
    };

    const handleDownload = async (fileId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/files/${fileId}/download`);
            if (!res.ok) throw new Error();
            const { downloadUrl } = await res.json();
            const a = Object.assign(document.createElement('a'), { href: downloadUrl, target: '_blank', rel: 'noopener noreferrer' });
            a.click();
        } catch {
            toast.error('Could not get download link');
        }
    };

    const patchFile = async (fileId: string, updates: { name?: string; folder?: string }) => {
        const res = await fetch(`/api/projects/${projectId}/files/${fileId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        if (!res.ok) throw new Error();
    };

    const handleRenameCommit = async () => {
        if (!renaming?.value.trim()) { setRenaming(null); return; }
        try {
            await patchFile(renaming.fileId, { name: renaming.value.trim() });
            toast.success('File renamed');
            void fetchFiles();
        } catch {
            toast.error('Could not rename file');
        } finally { setRenaming(null); }
    };

    const handleMoveCommit = async () => {
        if (!moving) { setMoving(null); return; }
        try {
            await patchFile(moving.fileId, { folder: moving.value.trim() || 'Root' });
            toast.success('File moved');
            void fetchFiles();
        } catch {
            toast.error('Could not move file');
        } finally { setMoving(null); }
    };

    const handleUploadVersion = async (file: File, targetFileId: string) => {
        setUploadingVersion(true);
        try {
            // Get presigned URL
            const presignRes = await fetch('/api/uploads/presign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filename: file.name, contentType: file.type, projectId }),
            });
            if (!presignRes.ok) throw new Error('Could not get upload URL');
            const { uploadUrl, key } = await presignRes.json();

            // Upload
            const uploadRes = await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
            if (!uploadRes.ok) throw new Error('Upload failed');

            // Confirm as new version
            const confirmRes = await fetch(`/api/projects/${projectId}/files/${targetFileId}/version`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, size: file.size }),
            });
            if (!confirmRes.ok) throw new Error('Could not confirm version');

            toast.success('New version uploaded');
            void fetchFiles();
            setVersionFile(null);
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Upload failed');
        } finally {
            setUploadingVersion(false);
        }
    };

    const filteredFiles = files.filter(f =>
        f.originalName.toLowerCase().includes(search.toLowerCase())
    );

    const folders = ['All Files', ...Array.from(new Set(files.map(f => f.folder || 'Root')))];

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ background: 'var(--surface-muted)' }} />
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <ConfirmDialog
                open={deleteConfirm.open}
                onOpenChange={(open) => setDeleteConfirm(s => ({ ...s, open }))}
                title="Delete File"
                description={`"${deleteConfirm.name}" will be permanently deleted. This cannot be undone.`}
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={() => executeDelete(deleteConfirm.id)}
            />
            {/* Search + folder filter */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex-1 max-w-xs">
                    <GlassInput
                        placeholder="Search files…"
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        icon={<Search size={14} />}
                    />
                </div>
                <div
                    className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl"
                    style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}
                >
                    {folders.map(folder => (
                        <button
                            key={folder}
                            onClick={() => setSelectedFolder(folder)}
                            className="shrink-0 px-3 h-8 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
                            style={{
                                background: selectedFolder === folder ? 'var(--accent)' : 'transparent',
                                color: selectedFolder === folder ? 'var(--primary-foreground)' : 'var(--text-muted)',
                                boxShadow: selectedFolder === folder ? 'var(--glow-sm)' : 'none',
                            }}
                        >
                            {folder}
                        </button>
                    ))}
                </div>
            </div>

            {filteredFiles.length === 0 ? (
                <div
                    className="flex flex-col items-center justify-center py-28 rounded-2xl text-center"
                    style={{ border: '2px dashed var(--border-medium)' }}
                >
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--surface-muted)' }}>
                        <FolderOpen size={28} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <h4 className="font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
                        {search ? 'No files match your search' : 'No files yet'}
                    </h4>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                        {search ? 'Try a different search term.' : 'Upload files using the Upload tab.'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredFiles.map(file => (
                        <GlassCard key={file._id} className="p-0 overflow-hidden group rounded-2xl">
                            <div className="p-5 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div
                                        className="h-14 w-14 rounded-xl flex items-center justify-center transition-all group-hover:scale-105"
                                        style={{ background: 'var(--surface-muted)' }}
                                    >
                                        {getFileIcon(file.mimeType)}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <GlassButton variant="ghost" size="icon" className="h-8 w-8 rounded-xl opacity-0 group-hover:opacity-100">
                                                <MoreVertical size={15} />
                                            </GlassButton>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="p-1.5 min-w-[170px]" style={{ background: 'var(--popover)', borderColor: 'var(--border-medium)', boxShadow: 'var(--shadow-modal)' }}>
                                            {onPreview && (
                                                <DropdownMenuItem onClick={() => onPreview(file)} className="rounded-lg gap-2 px-3 py-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                                    <Eye size={13} style={{ color: 'var(--accent)' }} /> Quick Look
                                                </DropdownMenuItem>
                                            )}
                                            <DropdownMenuItem onClick={() => handleDownload(file._id)} className="rounded-lg gap-2 px-3 py-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                                <Download size={13} /> Download
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setRenaming({ fileId: file._id, value: file.originalName })} className="rounded-lg gap-2 px-3 py-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                                <Pencil size={13} /> Rename
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setMoving({ fileId: file._id, value: file.folder || 'Root' })} className="rounded-lg gap-2 px-3 py-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                                <FolderInput size={13} /> Move to folder
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => setVersionFile(file)} className="rounded-lg gap-2 px-3 py-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--text-primary)' }}>
                                                <History size={13} /> Version history
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator style={{ background: 'var(--border-subtle)' }} className="my-1" />
                                            <DropdownMenuItem onClick={() => handleDelete(file._id, file.originalName)} className="rounded-lg gap-2 px-3 py-2 text-xs font-semibold cursor-pointer" style={{ color: 'var(--destructive)' }}>
                                                <Trash2 size={13} /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                {renaming?.fileId === file._id ? (
                                    <div className="flex items-center gap-1.5">
                                        <input
                                            ref={renameRef}
                                            value={renaming.value}
                                            onChange={e => setRenaming({ ...renaming, value: e.target.value })}
                                            onKeyDown={e => { if (e.key === 'Enter') void handleRenameCommit(); if (e.key === 'Escape') setRenaming(null); }}
                                            className="flex-1 text-xs rounded-lg px-2 py-1.5 outline-none"
                                            style={{ background: 'var(--input)', border: '1.5px solid var(--accent)', color: 'var(--text-primary)' }}
                                        />
                                        <button onClick={() => void handleRenameCommit()} className="p-1.5 rounded-lg" style={{ color: 'var(--success)', background: 'var(--success-bg)' }}><Check size={12} /></button>
                                        <button onClick={() => setRenaming(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)', background: 'var(--surface-muted)' }}><X size={12} /></button>
                                    </div>
                                ) : moving?.fileId === file._id ? (
                                    <div className="space-y-1.5">
                                        <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Folder name</p>
                                        <div className="flex items-center gap-1.5">
                                            <input
                                                ref={moveRef}
                                                value={moving.value}
                                                onChange={e => setMoving({ ...moving, value: e.target.value })}
                                                onKeyDown={e => { if (e.key === 'Enter') void handleMoveCommit(); if (e.key === 'Escape') setMoving(null); }}
                                                placeholder="Folder name…"
                                                className="flex-1 text-xs rounded-lg px-2 py-1.5 outline-none"
                                                style={{ background: 'var(--input)', border: '1.5px solid var(--accent)', color: 'var(--text-primary)' }}
                                            />
                                            <button onClick={() => void handleMoveCommit()} className="p-1.5 rounded-lg" style={{ color: 'var(--success)', background: 'var(--success-bg)' }}><Check size={12} /></button>
                                            <button onClick={() => setMoving(null)} className="p-1.5 rounded-lg" style={{ color: 'var(--text-muted)', background: 'var(--surface-muted)' }}><X size={12} /></button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold truncate leading-tight" style={{ color: 'var(--text-primary)' }} title={file.originalName}>
                                            {file.originalName}
                                        </p>
                                        <div className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                            <span>{bytes(file.size)}</span>
                                            <span>·</span>
                                            <span>{format(new Date(file.updatedAt), 'MMM d')}</span>
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center gap-2">
                                    <GlassBadge variant="slate" className="text-[9px] px-2 py-0.5">{file.folder || 'Root'}</GlassBadge>
                                    {file.versions && file.versions.length > 0 && (
                                        <button onClick={() => setVersionFile(file)}>
                                            <GlassBadge variant="indigo" className="text-[9px] px-2 py-0.5 cursor-pointer hover:opacity-80">v{file.versions.length + 1}</GlassBadge>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}

            {/* Version history dialog */}
            <Dialog open={!!versionFile} onOpenChange={(open) => { if (!open) setVersionFile(null); }}>
                <DialogContent
                    className="sm:max-w-lg rounded-2xl border-0 p-0 overflow-hidden"
                    style={{ background: 'var(--surface)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-modal)' }}
                >
                    <div className="h-1" style={{ background: 'var(--accent-gradient)' }} />
                    <div className="p-6">
                        <DialogHeader className="mb-5">
                            <DialogTitle style={{ color: 'var(--text-primary)' }}>
                                Version History
                            </DialogTitle>
                            {versionFile && (
                                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                                    {versionFile.originalName}
                                </p>
                            )}
                        </DialogHeader>

                        {versionFile && (
                            <div className="space-y-4">
                                {/* Upload new version */}
                                <input
                                    ref={versionInputRef}
                                    type="file"
                                    className="hidden"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file && versionFile) void handleUploadVersion(file, versionFile._id);
                                        e.target.value = '';
                                    }}
                                />
                                <GlassButton
                                    className="w-full gap-2"
                                    disabled={uploadingVersion}
                                    onClick={() => versionInputRef.current?.click()}
                                >
                                    <Upload size={14} />
                                    {uploadingVersion ? 'Uploading…' : 'Upload new version'}
                                </GlassButton>

                                {/* Current version */}
                                <div className="space-y-2">
                                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                                        Versions
                                    </p>

                                    {/* Current (latest) */}
                                    <VersionRow
                                        label={`v${(versionFile.versions?.length ?? 0) + 1} — Current`}
                                        size={versionFile.size}
                                        date={versionFile.updatedAt}
                                        isCurrent
                                        onDownload={() => handleDownload(versionFile._id)}
                                    />

                                    {/* Previous versions (newest first) */}
                                    {[...(versionFile.versions ?? [])].reverse().map((v: FileVersionRecord, i: number) => (
                                        <VersionRow
                                            key={v.r2Key}
                                            label={`v${(versionFile.versions?.length ?? 0) - i}`}
                                            size={v.size}
                                            date={v.uploadedAt}
                                            isCurrent={false}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function VersionRow({
    label, size, date, isCurrent, onDownload,
}: {
    label: string;
    size: number;
    date: string;
    isCurrent: boolean;
    onDownload?: () => void;
}) {
    return (
        <div
            className="flex items-center justify-between rounded-xl p-3"
            style={{
                background: isCurrent ? 'var(--accent-light)' : 'var(--surface-muted)',
                border: `1px solid ${isCurrent ? 'var(--border-medium)' : 'var(--border-subtle)'}`,
            }}
        >
            <div>
                <p className="text-sm font-semibold" style={{ color: isCurrent ? 'var(--accent)' : 'var(--text-primary)' }}>
                    {label}
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                    {bytes(size)} · {formatDistanceToNow(new Date(date), { addSuffix: true })}
                </p>
            </div>
            {onDownload && (
                <button
                    onClick={onDownload}
                    className="p-2 rounded-lg transition-colors hover:bg-[var(--accent-light)]"
                    style={{ color: 'var(--accent)' }}
                >
                    <Download size={14} />
                </button>
            )}
        </div>
    );
}
