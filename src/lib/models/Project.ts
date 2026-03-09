import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { MILESTONE_STATUSES, PROJECT_STATUSES } from '@/lib/contracts';

export interface IMilestone {
    _id?: Types.ObjectId;
    title: string;
    status: 'not_started' | 'in_progress' | 'in_review' | 'complete';
    dueDate?: Date;
    order: number;
}

export interface IProject extends Document {
    freelancerId: Types.ObjectId;
    clientName: string;
    clientEmail: string;
    title: string;
    description?: string;
    status: 'active' | 'completed' | 'archived';
    portalTokenHash: string;
    portalTokenPrefix: string;
    portalEnabled: boolean;
    requireEmailVerification: boolean;
    milestones: IMilestone[];
    createdAt: Date;
    updatedAt: Date;
}

const MilestoneSchema = new Schema<IMilestone>({
    title: { type: String, required: true },
    status: {
        type: String,
        enum: MILESTONE_STATUSES,
        default: 'not_started',
    },
    dueDate: { type: Date },
    order: { type: Number, default: 0 },
});

const ProjectSchema = new Schema<IProject>(
    {
        freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        clientName: { type: String, required: true },
        clientEmail: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String },
        status: { type: String, enum: PROJECT_STATUSES, default: 'active' },
        portalTokenHash: { type: String, required: true },
        portalTokenPrefix: { type: String, required: true },
        portalEnabled: { type: Boolean, default: true },
        requireEmailVerification: { type: Boolean, default: false },
        milestones: [MilestoneSchema],
    },
    { timestamps: true }
);

ProjectSchema.index({ freelancerId: 1 });
ProjectSchema.index({ portalTokenPrefix: 1 });

const Project: Model<IProject> = mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
export default Project;
