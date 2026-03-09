'use client';

import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { HardDrive } from 'lucide-react';
import bytes from 'bytes';

export function StorageQuota() {
    const [storageUsed, setStorageUsed] = useState(0);
    const quota = 5 * 1024 * 1024 * 1024; // 5GB limit

    useEffect(() => {
        // Fetch current user data for storage
        const fetchStorage = async () => {
            try {
                const res = await fetch('/api/user/settings');
                const data = await res.json();
                if (data?.storageUsed !== undefined) {
                    setStorageUsed(data.storageUsed);
                }
            } catch (error) {
                console.error('Failed to fetch storage info');
            }
        };
        fetchStorage();
        // Set interval to sync storage status
        const interval = setInterval(fetchStorage, 30000);
        return () => clearInterval(interval);
    }, []);

    const percentage = Math.min((storageUsed / quota) * 100, 100);

    return (
        <div className="glass-card p-4 space-y-3 border-white/5 bg-white/5">
            <div className="flex items-center justify-between text-xs font-medium">
                <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <HardDrive size={14} />
                    <span>Storage Usage</span>
                </div>
                <span className={percentage > 90 ? 'text-red-400' : 'text-indigo-400'}>
                    {Math.round(percentage)}%
                </span>
            </div>

            <Progress value={percentage} className="h-1.5 bg-white/5" />

            <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)]">
                <span>{bytes(storageUsed)} used</span>
                <span>5 GB limit</span>
            </div>
        </div>
    );
}
