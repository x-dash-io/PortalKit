'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogOverlay
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface GlassModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    maxWidth?: string;
}

export const GlassModal = ({ isOpen, onClose, title, children, maxWidth = 'sm:max-w-[500px]' }: GlassModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={cn(
                'p-0 bg-transparent border-none shadow-none',
                maxWidth
            )}>
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 8 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 8 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="glass-card w-full border-white/5 p-8"
                >
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-black text-[var(--text-primary)]">
                            {title}
                        </DialogTitle>
                    </DialogHeader>
                    {children}
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};
