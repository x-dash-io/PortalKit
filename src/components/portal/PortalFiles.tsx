'use client';

import { Calendar, Download, FileIcon, FileText, Film, HardDrive, ImageIcon, Music, Archive } from 'lucide-react';
import { format } from 'date-fns';
import bytes from 'bytes';
import { toast } from 'sonner';
import type { FileRecord } from '@/lib/contracts';

interface PortalFilesProps {
  files: FileRecord[];
  token: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return { icon: <ImageIcon size={24} />, color: 'var(--accent)', bg: 'var(--accent-light)' };
  if (mimeType.startsWith('video/')) return { icon: <Film size={24} />, color: 'var(--warning)', bg: 'rgba(245,158,11,0.12)' };
  if (mimeType.startsWith('audio/')) return { icon: <Music size={24} />, color: 'var(--warning)', bg: 'rgba(245,158,11,0.12)' };
  if (mimeType === 'application/pdf') return { icon: <FileText size={24} />, color: 'var(--destructive)', bg: 'var(--destructive-bg)' };
  if (mimeType.includes('zip') || mimeType.includes('tar')) return { icon: <Archive size={24} />, color: 'var(--success)', bg: 'var(--success-bg)' };
  return { icon: <FileIcon size={24} />, color: 'var(--text-muted)', bg: 'var(--surface-muted)' };
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

  // Group files by folder
  const byFolder = files.reduce<Record<string, FileRecord[]>>((acc, f) => {
    const folder = f.folder || 'Root';
    (acc[folder] ??= []).push(f);
    return acc;
  }, {});

  const folderNames = Object.keys(byFolder).sort((a, b) => a === 'Root' ? -1 : b === 'Root' ? 1 : a.localeCompare(b));

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>Files</h3>
        <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>Download the latest deliverables and shared project assets.</p>
      </div>

      {files.length === 0 ? (
        <div
          className="glass-card rounded-[2rem] py-20 text-center"
          style={{ border: '2px dashed var(--border-subtle)', color: 'var(--text-secondary)' }}
        >
          No files shared yet.
        </div>
      ) : (
        <div className="space-y-8">
          {folderNames.map(folder => (
            <div key={folder} className="space-y-4">
              {folderNames.length > 1 && (
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                  📁 {folder}
                </p>
              )}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {byFolder[folder].map((file) => {
                  const { icon, color, bg } = getFileIcon(file.mimeType);
                  return (
                    <div key={file._id} className="glass-card rounded-[2rem] p-6 transition-all hover:translate-y-[-2px]">
                      <div className="flex items-start gap-4">
                        <div
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl"
                          style={{ background: bg, color }}
                        >
                          {icon}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4
                            className="truncate text-base font-semibold leading-tight"
                            style={{ color: 'var(--text-primary)' }}
                            title={file.originalName}
                          >
                            {file.originalName}
                          </h4>
                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                            <span className="flex items-center gap-1"><HardDrive size={11} />{bytes(file.size) ?? '0 B'}</span>
                            <span className="flex items-center gap-1"><Calendar size={11} />{format(new Date(file.createdAt), 'MMM d, yyyy')}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => void handleDownload(file._id, file.originalName)}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold transition-all hover:opacity-90"
                        style={{ background: 'var(--accent-gradient)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow-sm)' }}
                      >
                        <Download size={15} />
                        Download
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
