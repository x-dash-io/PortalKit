'use client';

import React, { useState } from 'react';
import { FileGrid } from './FileGrid';
import { FileUploader } from './FileUploader';
import { FilePreview } from './FilePreview';
import { GlassCard } from '@/components/glass/GlassCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutGrid, UploadCloud } from 'lucide-react';
import { toast } from 'sonner';
import type { FileRecord } from '@/lib/contracts';

interface FileWorkspaceProps {
    projectId: string;
}

export function FileWorkspace({ projectId }: FileWorkspaceProps) {
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedFile, setSelectedFile] = useState<FileRecord | null>(null);

    const handleUploadComplete = () => setRefreshKey(prev => prev + 1);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>File Hub</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage and share project assets securely</p>
                </div>
            </div>

            <Tabs defaultValue="grid" className="space-y-6">
                <TabsList
                    className="p-1 rounded-xl h-11 inline-flex"
                    style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-subtle)' }}
                >
                    <TabsTrigger
                        value="grid"
                        className="rounded-lg px-5 h-full gap-2 transition-all text-[10px] font-bold uppercase tracking-widest data-[state=active]:shadow-sm"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <LayoutGrid size={13} />
                        Grid View
                    </TabsTrigger>
                    <TabsTrigger
                        value="upload"
                        className="rounded-lg px-5 h-full gap-2 transition-all text-[10px] font-bold uppercase tracking-widest data-[state=active]:shadow-sm"
                        style={{ color: 'var(--text-muted)' }}
                    >
                        <UploadCloud size={13} />
                        Upload
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="grid" className="focus-visible:outline-none">
                    <FileGrid
                        projectId={projectId}
                        refreshTrigger={refreshKey}
                        onPreview={(file) => setSelectedFile(file)}
                    />
                </TabsContent>

                <TabsContent value="upload" className="focus-visible:outline-none">
                    <GlassCard className="p-12 border-dashed flex flex-col items-center justify-center text-center">
                        <div className="max-w-md w-full">
                            <FileUploader
                                projectId={projectId}
                                onComplete={() => {
                                    handleUploadComplete();
                                    toast.success('Upload complete!');
                                }}
                            />
                        </div>
                    </GlassCard>
                </TabsContent>
            </Tabs>

            <FilePreview
                file={selectedFile}
                projectId={projectId}
                onClose={() => setSelectedFile(null)}
                onVersionUploaded={() => {
                    handleUploadComplete();
                    setSelectedFile(null);
                }}
            />
        </div>
    );
}
