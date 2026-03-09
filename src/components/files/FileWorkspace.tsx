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

    const handleUploadComplete = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white tracking-tight">File Hub</h3>
                    <p className="text-sm font-bold text-[var(--text-muted)]">Manage and share project assets securely</p>
                </div>
            </div>

            <Tabs defaultValue="grid" className="space-y-6">
                <TabsList className="bg-white/5 border border-white/5 p-1 rounded-xl h-12 inline-flex shadow-xl backdrop-blur-md">
                    <TabsTrigger value="grid" className="rounded-lg px-6 data-[state=active]:bg-white/10 data-[state=active]:text-white h-full gap-2 transition-all font-bold text-[10px] uppercase tracking-widest">
                        <LayoutGrid size={14} />
                        Grid View
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="rounded-lg px-6 data-[state=active]:bg-white/10 data-[state=active]:text-white h-full gap-2 transition-all font-bold text-[10px] uppercase tracking-widest">
                        <UploadCloud size={14} />
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
