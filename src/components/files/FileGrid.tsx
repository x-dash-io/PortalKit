'use client';

import React, { useState, useEffect } from 'react';
import {
    FileIcon,
    FileText,
    ImageIcon,
    Film,
    Download,
    Trash2,
    MoreVertical,
    History,
    Eye,
    Search,
    FolderOpen
} from 'lucide-react';
import { format } from 'date-fns';
import bytes from 'bytes';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { FileListResponse, FileRecord } from '@/lib/contracts';

// Glass Components
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassInput } from '@/components/glass/GlassInput';

interface FileGridProps {
    projectId: string;
    refreshTrigger: number;
    onPreview?: (file: FileRecord) => void;
}

export function FileGrid({ projectId, refreshTrigger, onPreview }: FileGridProps) {
    const [files, setFiles] = useState<FileRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedFolder, setSelectedFolder] = useState('All Files');

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/files?folder=${selectedFolder === 'All Files' ? '' : selectedFolder}`);
            if (!res.ok) throw new Error('Failed to fetch files');
            const data = (await res.json()) as FileListResponse;
            setFiles(data.items);
        } catch (error) {
            toast.error('Could not load files');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [projectId, refreshTrigger, selectedFolder]);

    const handleDelete = async (fileId: string) => {
        if (!confirm('Are you sure you want to delete this file?')) return;
        try {
            const res = await fetch(`/api/projects/${projectId}/files/${fileId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Delete failed');
            toast.success('File deleted');
            fetchFiles();
        } catch (error) {
            toast.error('Could not delete file');
        }
    };

    const handleDownload = async (fileId: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/files/${fileId}/download`);
            if (!res.ok) throw new Error('Download failed');
            const { downloadUrl } = await res.json();
            window.open(downloadUrl, '_blank');
        } catch (error) {
            toast.error('Could not get download link');
        }
    };

    const filteredFiles = files.filter((file) =>
        file.originalName.toLowerCase().includes(search.toLowerCase()) ||
        file.name.toLowerCase().includes(search.toLowerCase())
    );

    const folders = ['All Files', ...new Set(files.map((file) => file.folder || 'Root'))];

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return <ImageIcon className="text-blue-400" size={28} />;
        if (mimeType.startsWith('video/')) return <Film className="text-purple-400" size={28} />;
        if (mimeType === 'application/pdf') return <FileText className="text-red-400" size={28} />;
        return <FileIcon className="text-white/40" size={28} />;
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="w-full md:w-96">
                    <GlassInput
                        placeholder="Search assets..."
                        value={search}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
                        icon={<Search size={18} className="text-white/40" />}
                    />
                </div>
                <div className="flex items-center gap-3 overflow-x-auto pb-1 w-full md:w-auto bg-white/5 p-1 rounded-2xl border border-white/5">
                    {folders.map((folder) => (
                        <button
                            key={folder}
                            onClick={() => setSelectedFolder(folder)}
                            className={cn(
                                "px-6 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                selectedFolder === folder
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                    : "text-white/40 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {folder}
                        </button>
                    ))}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="h-56 glass-card animate-pulse rounded-3xl bg-white/5" />
                    ))}
                </div>
            ) : filteredFiles.length === 0 ? (
                <div className="text-center py-40 glass-card bg-transparent border-dashed border-white/5 rounded-[3rem]">
                    <div className="bg-white/5 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                        <FolderOpen size={40} className="text-[var(--text-muted)]" />
                    </div>
                    <h4 className="text-white font-black text-xl mb-2">No items found</h4>
                    <p className="text-[var(--text-muted)] text-sm font-bold">Try searching for something else or upload new files.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredFiles.map((file) => (
                        <GlassCard key={file._id} className="p-0 overflow-hidden group hover:border-indigo-500/30 transition-all duration-500 rounded-3xl">
                            <div className="p-6 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="h-16 w-16 bg-white/5 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:bg-indigo-500/10 group-hover:scale-110">
                                        {getFileIcon(file.mimeType)}
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <GlassButton variant="ghost" size="icon" className="h-10 w-10 hover:bg-white/10 rounded-xl transition-all">
                                                <MoreVertical size={18} />
                                            </GlassButton>
                                    </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="glass-card border-white/10 p-2 min-w-[180px] shadow-2xl backdrop-blur-3xl">
                                            <DropdownMenuItem onClick={() => onPreview?.(file)} className="rounded-xl focus:bg-indigo-600/10 gap-3 px-4 py-2.5 font-bold text-xs">
                                                <Eye size={16} className="text-indigo-400" /> Quick Look
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDownload(file._id)} className="rounded-xl focus:bg-indigo-600/10 gap-3 px-4 py-2.5 font-bold text-xs">
                                                <Download size={16} /> Download
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="rounded-xl focus:bg-indigo-600/10 gap-3 px-4 py-2.5 font-bold text-xs">
                                                <History size={16} /> Version History
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator className="bg-white/5 my-2" />
                                            <DropdownMenuItem onClick={() => handleDelete(file._id)} className="rounded-xl focus:bg-red-600/10 gap-3 px-4 py-2.5 font-bold text-xs text-red-500">
                                                <Trash2 size={16} /> Remove File
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <div className="space-y-2">
                                    <p className="text-base font-black truncate text-white tracking-tight" title={file.originalName}>
                                        {file.originalName}
                                    </p>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{bytes(file.size)}</span>
                                        <span className="w-1.5 h-1.5 bg-white/10 rounded-full" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">{format(new Date(file.updatedAt), 'MMM dd')}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-2">
                                    <GlassBadge variant="slate" className="text-[9px] px-3">
                                        {file.folder}
                                    </GlassBadge>
                                    {file.versions && file.versions.length > 0 && (
                                        <GlassBadge variant="indigo" className="text-[9px] px-3">
                                            v{file.versions.length + 1}
                                        </GlassBadge>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>
            )}
        </div>
    );
}
