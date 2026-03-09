'use client';

import { Calendar, Download, FileIcon, HardDrive } from 'lucide-react';
import { format } from 'date-fns';
import bytes from 'bytes';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import type { FileRecord } from '@/lib/contracts';

interface PortalFilesProps {
  files: FileRecord[];
  token: string;
}

export function PortalFiles({ files, token }: PortalFilesProps) {
  const handleDownload = async (fileId: string, filename: string) => {
    try {
      const res = await fetch(`/api/portal/${token}/files/${fileId}/download`);
      if (!res.ok) throw new Error('Download failed');
      const { downloadUrl } = await res.json();

      const anchor = document.createElement('a');
      anchor.href = downloadUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
    } catch {
      toast.error('Could not download file. Please try again.');
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight text-[var(--text-primary)]">Files</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">Download the latest deliverables and shared project assets.</p>
      </div>

      {files.length === 0 ? (
        <div className="glass-card rounded-[2rem] border border-dashed border-[var(--border-subtle)] bg-transparent py-20 text-center text-[var(--text-secondary)]">
          No files shared yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {files.map((file) => (
            <div key={file._id} className="glass-card rounded-[2rem] p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[var(--accent-light)] text-[var(--accent)]">
                  <FileIcon size={24} />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="truncate text-lg font-medium text-[var(--text-primary)]" title={file.originalName}>
                    {file.originalName}
                  </h4>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[var(--text-muted)]">
                    <div className="flex items-center gap-1.5">
                      <HardDrive size={12} />
                      {bytes(file.size) ?? '0 B'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      {format(new Date(file.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => handleDownload(file._id, file.originalName)}
                variant="outline"
                className="mt-6 h-12 w-full rounded-2xl border-[var(--border-subtle)] bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--muted)]"
              >
                <Download size={16} />
                Download
              </Button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
