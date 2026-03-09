'use client';

import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2, Smile } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ApprovalCommentRecord } from '@/lib/contracts';

import { GlassBadge } from '@/components/glass/GlassBadge';
import { GlassButton } from '@/components/glass/GlassButton';

interface CommentThreadProps {
    approvalId: string;
    projectId: string;
    initialComments: ApprovalCommentRecord[];
    currentUserType: 'freelancer' | 'client';
    portalToken?: string;
}

export function CommentThread({ approvalId, projectId, initialComments, currentUserType, portalToken }: CommentThreadProps) {
    const [comments, setComments] = useState<ApprovalCommentRecord[]>(initialComments);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setIsSubmitting(true);
        try {
            const endpoint =
                currentUserType === 'client' && portalToken
                    ? `/api/portal/${portalToken}/approvals/${approvalId}/comment`
                    : `/api/projects/${projectId}/approvals/${approvalId}/comment`;

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: newComment }),
            });

            if (!res.ok) throw new Error('Failed to post comment');
            const data = await res.json();

            setComments([...comments, data]);
            setNewComment('');
            toast.success('Response recorded');
        } catch (error) {
            toast.error('Could not transmit message');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-8">
            <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Discussion Thread</h4>
                <GlassBadge variant="slate" className="px-3">{comments.length} Messages</GlassBadge>
            </div>

            <div className="flex-1 space-y-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-white/5 scrollbar-track-transparent">
                {comments.length === 0 ? (
                    <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/5 rounded-[2rem]">
                        <Smile className="mx-auto text-white/10 mb-4" size={32} />
                        <p className="text-xs font-black uppercase tracking-widest text-white/20">
                            No feedback yet.
                        </p>
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div
                            key={comment._id ?? `${comment.author}-${comment.createdAt}`}
                            className={cn(
                                "flex flex-col gap-2 max-w-[90%] transition-all duration-500",
                                comment.author === currentUserType ? "ml-auto items-end" : "items-start"
                            )}
                        >
                            <div className="flex items-center gap-3 mb-1">
                                <span className={cn(
                                    "text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest",
                                    comment.author === 'freelancer'
                                        ? "bg-indigo-500/10 text-indigo-400"
                                        : "bg-emerald-500/10 text-emerald-400"
                                )}>
                                    {comment.author}
                                </span>
                                <span className="text-[9px] font-bold text-white/20 uppercase tracking-tighter">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                </span>
                            </div>
                            <div className={cn(
                                "px-5 py-3.5 rounded-2xl text-sm font-medium leading-relaxed transition-all duration-500",
                                comment.author === currentUserType
                                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-600/20 rounded-tr-[4px]"
                                    : "bg-white/5 border border-white/5 text-white/80 rounded-tl-[4px] backdrop-blur-md"
                            )}>
                                {comment.text}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="relative group">
                <div className="absolute inset-0 bg-indigo-500/5 blur-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                <textarea
                    placeholder="Provide your feedback..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full min-h-[120px] bg-white/5 border border-white/5 rounded-[2rem] p-6 text-white text-sm placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium leading-relaxed relative z-10"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSubmit(e);
                        }
                    }}
                />
                <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
                    <GlassButton
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 shadow-xl shadow-indigo-600/20 border-none transition-all group-active:scale-95"
                    >
                        {isSubmitting ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <><Send size={18} className="mr-2" /> Send Message</>
                        )}
                    </GlassButton>
                </div>
            </form>
        </div>
    );
}
