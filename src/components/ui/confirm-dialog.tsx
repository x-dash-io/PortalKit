'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'destructive' | 'default';
  onConfirm: () => void;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'destructive',
  onConfirm,
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onOpenChange(false);
    onConfirm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-sm rounded-2xl"
        style={{
          background: 'var(--surface)',
          border: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-modal)',
        }}
      >
        <DialogHeader className="space-y-2 pb-1">
          <DialogTitle
            className="text-lg font-black tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            {title}
          </DialogTitle>
          <DialogDescription
            className="text-sm leading-relaxed"
            style={{ color: 'var(--text-secondary)' }}
          >
            {description}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 pt-2 flex-row">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl font-semibold text-sm h-10"
            style={{
              background: 'var(--surface-muted)',
              border: '1px solid var(--border-medium)',
              color: 'var(--text-secondary)',
            }}
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 rounded-xl font-bold text-sm h-10"
            style={
              variant === 'destructive'
                ? { background: 'var(--destructive)', color: '#fff', border: 'none' }
                : { background: 'var(--accent-gradient)', color: 'var(--primary-foreground)', boxShadow: 'var(--glow-sm)', border: 'none' }
            }
          >
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
