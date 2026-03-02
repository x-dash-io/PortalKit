'use client';

import React from 'react';
import { Download, FileIcon, Calendar, HardDrive } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import bytes from 'bytes';

interface PortalFilesProps {
    files: any[];
    token: string;
}

export function PortalFiles({ files, token }: PortalFilesProps) {
    const handleDownload = async (fileId: string, filename: string) => {
        try {
            const res = await fetch(`/api/portal/${token}/files/${fileId}/download`);
            if (!res.ok) throw new Error('Download failed');
            const { downloadUrl } = await res.json();

            const a = document.createElement('a');
            a.href = downloadUrl;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (e) {
            alert('Could not download file. Please try again.');
        }
    };

    return (
        <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-2xl font-black text-white">Project Files</h3>
                    <p className="text-sm text-[var(--text-muted)]">Download your project deliverables and assets.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {files.map((file) => (
                    <div key={file._id} className="glass-card p-6 border-white/5 hover:bg-white/5 transition-all group relative overflow-hidden">
                        <div className="flex items-start gap-4">
                            <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 group-hover:scale-110 transition-transform">
                                <FileIcon size={24} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white truncate text-lg" title={file.filename}>
                                    {file.filename}
                                </h4>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                        <HardDrive size={12} />
                                        {bytes(file.size)}
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                        <Calendar size={12} />
                                        {format(new Date(file.createdAt), 'MMM dd, yyyy')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => handleDownload(file._id, file.filename)}
                            className="w-full mt-6 bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 text-white rounded-xl h-12 gap-2 transition-all font-bold"
                        >
                            <Download size={18} />
                            Download
                        </Button>
                    </div>
                ))}

                {files.length === 0 && (
                    <div className="col-span-full py-20 text-center glass-card border-dashed border-white/10 bg-transparent">
                        <p className="text-[var(--text-muted)]">No files shared yet.</p>
                    </div>
                )}
            </div>
        </section>
    );
}
