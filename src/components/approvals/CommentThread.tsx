'use client';

import React, { useState, useRef, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import type { ApprovalCommentRecord } from '@/lib/contracts';
import { GlassBadge } from '@/components/glass/GlassBadge';

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
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments]);

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

            if (!res.ok) throw new Error();
            const data = await res.json();
            setComments(prev => [...prev, data]);
            setNewComment('');
        } catch {
            toast.error('Could not send message');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                    Discussion
                </p>
                <GlassBadge variant="slate" className="px-2 py-0.5 text-[9px]">
                    {comments.length} {comments.length === 1 ? 'message' : 'messages'}
                </GlassBadge>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 space-y-3 max-h-72 overflow-y-auto pr-1"
            >
                {comments.length === 0 ? (
                    <div
                        className="flex flex-col items-center justify-center py-10 rounded-xl text-center"
                        style={{ background: 'var(--surface-muted)', border: '1px dashed var(--border-medium)' }}
                    >
                        <MessageSquare size={24} style={{ color: 'var(--text-muted)' }} className="mb-2" />
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No messages yet</p>
                    </div>
                ) : (
                    comments.map((comment) => {
                        const isOwn = comment.author === currentUserType;
                        return (
                            <div
                                key={comment._id ?? `${comment.author}-${comment.createdAt}`}
                                className={cn('flex flex-col gap-1 max-w-[88%]', isOwn ? 'ml-auto items-end' : 'items-start')}
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest"
                                        style={{
                                            background: comment.author === 'freelancer' ? 'var(--accent-light)' : 'var(--success-bg)',
                                            color: comment.author === 'freelancer' ? 'var(--accent)' : 'var(--success)',
                                        }}
                                    >
                                        {comment.author}
                                    </span>
                                    <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                    </span>
                                </div>
                                <div
                                    className="px-4 py-2.5 rounded-xl text-sm leading-relaxed"
                                    style={isOwn ? {
                                        background: 'var(--accent)',
                                        color: 'var(--primary-foreground)',
                                        borderRadius: '12px 12px 2px 12px',
                                    } : {
                                        background: 'var(--surface-muted)',
                                        color: 'var(--text-primary)',
                                        border: '1px solid var(--border-subtle)',
                                        borderRadius: '12px 12px 12px 2px',
                                    }}
                                >
                                    {comment.text}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <form onSubmit={(e) => void handleSubmit(e)} className="relative">
                <textarea
                    placeholder="Write a message… (Enter to send)"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    rows={3}
                    className="w-full rounded-xl p-3 pr-14 text-sm resize-none outline-none transition-all"
                    style={{
                        background: 'var(--input)',
                        border: '1.5px solid var(--border-medium)',
                        color: 'var(--text-primary)',
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            void handleSubmit(e);
                        }
                    }}
                />
                <button
                    type="submit"
                    disabled={isSubmitting || !newComment.trim()}
                    className="absolute bottom-3 right-3 h-8 w-8 flex items-center justify-center rounded-lg transition-all disabled:opacity-40"
                    style={{ background: 'var(--accent)', color: 'var(--primary-foreground)' }}
                >
                    {isSubmitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
            </form>
        </div>
    );
}
