import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface IComment {
    _id: Types.ObjectId;
    author: 'freelancer' | 'client';
    text: string;
    createdAt: Date;
}

export interface IApproval extends Document {
    projectId: Types.ObjectId;
    freelancerId: Types.ObjectId;
    title: string;
    description?: string;
    type: 'file' | 'milestone' | 'design' | 'copy' | 'other';
    fileId?: Types.ObjectId;
    status: 'pending' | 'approved' | 'changes_requested';
    comments: IComment[];
    createdAt: Date;
    updatedAt: Date;
}

const CommentSchema = new Schema<IComment>({
    author: { type: String, enum: ['freelancer', 'client'], required: true },
    text: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const ApprovalSchema = new Schema<IApproval>(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
        freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        title: { type: String, required: true },
        description: { type: String },
        type: { type: String, enum: ['file', 'milestone', 'design', 'copy', 'other'], required: true },
        fileId: { type: Schema.Types.ObjectId, ref: 'File' },
        status: { type: String, enum: ['pending', 'approved', 'changes_requested'], default: 'pending' },
        comments: [CommentSchema],
    },
    { timestamps: true }
);

ApprovalSchema.index({ projectId: 1 });

const Approval: Model<IApproval> = mongoose.models.Approval || mongoose.model<IApproval>('Approval', ApprovalSchema);
export default Approval;
