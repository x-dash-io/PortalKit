'use client';

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    GripVertical,
    Trash2,
    Plus,
    Loader2
} from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Glass Components
import { GlassCard } from '@/components/glass/GlassCard';
import { GlassInput } from '@/components/glass/GlassInput';
import { GlassButton } from '@/components/glass/GlassButton';
import { GlassBadge } from '@/components/glass/GlassBadge';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

interface Milestone {
    _id: string;
    title: string;
    status: 'not_started' | 'in_progress' | 'in_review' | 'complete';
    dueDate?: string;
    order: number;
}

interface MilestoneTrackerProps {
    projectId: string;
    initialMilestones: Milestone[];
    onUpdate: (updatedMilestones: Milestone[]) => void;
}

export function MilestoneTracker({ projectId, initialMilestones, onUpdate }: MilestoneTrackerProps) {
    const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
    const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [isReordering, setIsReordering] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; id: string }>({ open: false, id: '' });

    useEffect(() => {
        setMilestones(initialMilestones);
    }, [initialMilestones]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = milestones.findIndex((m) => m._id === active.id);
            const newIndex = milestones.findIndex((m) => m._id === over.id);

            const newArr = arrayMove(milestones, oldIndex, newIndex);
            setMilestones(newArr);

            // Sync with backend
            setIsReordering(true);
            try {
                const res = await fetch(`/api/projects/${projectId}/milestones/reorder`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ milestones: newArr })
                });
                if (!res.ok) throw new Error('Failed to reorder');
                onUpdate(newArr);
            } catch (e) {
                toast.error('Reorder failed');
                setMilestones(milestones); // Rollback
            } finally {
                setIsReordering(false);
            }
        }
    };

    const addMilestone = async () => {
        if (!newMilestoneTitle.trim()) return;
        setIsAdding(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/milestones`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: newMilestoneTitle })
            });
            if (!res.ok) throw new Error('Failed to add');
            const data = await res.json();
            setNewMilestoneTitle('');
            toast.success('Milestone added');
            onUpdate([...milestones, data]);
        } catch (e) {
            toast.error('Could not add milestone');
        } finally {
            setIsAdding(false);
        }
    };

    const updateMilestone = async (id: string, updates: Partial<Milestone>) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/milestones/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Failed to update');
            const updated = milestones.map(m => m._id === id ? { ...m, ...updates } : m);
            onUpdate(updated);
        } catch (e) {
            toast.error('Update failed');
        }
    };

    const deleteMilestone = async (id: string) => {
        setDeleteConfirm({ open: true, id });
    };

    const executeDeleteMilestone = async (id: string) => {
        try {
            const res = await fetch(`/api/projects/${projectId}/milestones/${id}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Milestone removed');
            onUpdate(milestones.filter(m => m._id !== id));
        } catch (e) {
            toast.error('Delete failed');
        }
    };

    return (
        <div className="space-y-8">
            <ConfirmDialog
                open={deleteConfirm.open}
                onOpenChange={(open) => setDeleteConfirm(s => ({ ...s, open }))}
                title="Delete Milestone"
                description="This milestone will be permanently removed. This action cannot be undone."
                confirmLabel="Delete"
                variant="destructive"
                onConfirm={() => executeDeleteMilestone(deleteConfirm.id)}
            />
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h3 className="text-2xl font-black tracking-tight">Project Roadmap</h3>
                    <p className="text-sm font-bold text-[var(--text-muted)]">Organize and track your project deliverables</p>
                </div>
                {isReordering && (
                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'var(--accent-light)', border: '1px solid var(--accent)', color: 'var(--accent)' }}>
                        <Loader2 size={14} className="animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Syncing...</span>
                    </div>
                )}
            </div>

            <div className="space-y-4">
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={milestones.map(m => m._id)}
                        strategy={verticalListSortingStrategy}
                    >
                        <div className="space-y-3">
                            {milestones.map((milestone) => (
                                <SortableItem
                                    key={milestone._id}
                                    milestone={milestone}
                                    onUpdate={updateMilestone}
                                    onDelete={deleteMilestone}
                                />
                            ))}
                        </div>
                    </SortableContext>
                </DndContext>

                <GlassCard className="p-4 bg-[var(--surface-muted)] border-dashed flex gap-4 items-center">
                    <div className="h-12 w-12 flex items-center justify-center text-[var(--text-muted)] rounded-2xl">
                        <Plus size={24} />
                    </div>
                    <GlassInput
                        placeholder="Define next milestone..."
                        value={newMilestoneTitle}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMilestoneTitle(e.target.value)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && addMilestone()}
                        className="bg-transparent border-transparent py-0 h-10"
                    />
                    <GlassButton
                        disabled={isAdding || !newMilestoneTitle.trim()}
                        onClick={addMilestone}
                        className="h-12 px-10 rounded-2xl"
                    >
                        {isAdding ? <Loader2 size={18} className="animate-spin" /> : 'Create'}
                    </GlassButton>
                </GlassCard>
            </div>
        </div>
    );
}

function SortableItem({
    milestone,
    onUpdate,
    onDelete,
}: {
    milestone: Milestone;
    onUpdate: (id: string, updates: Partial<Milestone>) => void;
    onDelete: (id: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: milestone._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const statusVariants = {
        not_started: "slate" as const,
        in_progress: "indigo" as const,
        in_review: "amber" as const,
        complete: "emerald" as const,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={cn(
                "group relative z-10",
                isDragging && "z-50 shadow-2xl"
            )}
        >
            <GlassCard
                className={cn(
                    "flex items-center gap-6 p-4 transition-all duration-300",
                    isDragging ? "ring-2 ring-[var(--accent)] shadow-[var(--glow-sm)] bg-[var(--accent-light)]" : ""
                )}
            >
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing transition-colors h-12 w-8 flex items-center justify-center rounded-xl"
                    style={{ color: 'var(--text-muted)', background: 'var(--surface-muted)' }}
                >
                    <GripVertical size={20} />
                </div>

                <div className="flex-1 min-w-0">
                    <input
                        defaultValue={milestone.title}
                        onBlur={(e) => e.target.value !== milestone.title && onUpdate(milestone._id, { title: e.target.value })}
                        className="bg-transparent border-none focus:ring-0 font-bold text-base w-full outline-none text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
                        placeholder="Milestone title..."
                    />
                </div>

                <div className="flex items-center gap-4">
                    <Select
                        defaultValue={milestone.status}
                        onValueChange={(val) => onUpdate(milestone._id, { status: val as Milestone['status'] })}
                    >
                        <SelectTrigger className="h-10 border-none px-4 rounded-xl min-w-[140px] font-bold text-xs ring-0 focus:ring-0" style={{ background: 'var(--surface-muted)', color: 'var(--text-primary)' }}>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="glass-card rounded-xl p-1.5 shadow-xl" style={{ borderColor: 'var(--border-medium)' }}>
                            <SelectItem value="not_started" className="rounded-lg font-medium text-sm">Not Started</SelectItem>
                            <SelectItem value="in_progress" className="rounded-lg font-medium text-sm">In Progress</SelectItem>
                            <SelectItem value="in_review" className="rounded-lg font-medium text-sm">In Review</SelectItem>
                            <SelectItem value="complete" className="rounded-lg font-medium text-sm">Complete</SelectItem>
                        </SelectContent>
                    </Select>

                    <GlassBadge variant={statusVariants[milestone.status as keyof typeof statusVariants]}>
                        {milestone.status.replace('_', ' ')}
                    </GlassBadge>

                    <GlassButton
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(milestone._id)}
                        className="h-10 w-10 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all rounded-xl"
                    >
                        <Trash2 size={18} />
                    </GlassButton>
                </div>
            </GlassCard>
        </div>
    );
}
