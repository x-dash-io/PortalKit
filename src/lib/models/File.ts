import mongoose, { Schema, Document, Model, Types } from 'mongoose';
import { FILE_STATUSES } from '@/lib/contracts';

export interface IFileVersion {
    r2Key: string;
    uploadedAt: Date;
    size: number;
}

export interface IFile extends Document {
    projectId: Types.ObjectId;
    freelancerId: Types.ObjectId;
    name: string;
    originalName: string;
    r2Key: string;
    r2Bucket: string;
    mimeType: string;
    size: number;
    folder?: string;
    status: 'pending' | 'active';
    versions: IFileVersion[];
    createdAt: Date;
    updatedAt: Date;
}

const FileSchema = new Schema<IFile>(
    {
        projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
        freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        name: { type: String, required: true },
        originalName: { type: String, required: true },
        r2Key: { type: String, required: true },
        r2Bucket: { type: String, required: true, default: process.env.R2_BUCKET_NAME || 'default' },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        folder: { type: String },
        status: { type: String, enum: FILE_STATUSES, default: 'pending' },
        versions: [
            {
                r2Key: { type: String, required: true },
                uploadedAt: { type: Date, default: Date.now },
                size: { type: Number, required: true },
            },
        ],
    },
    { timestamps: true }
);

FileSchema.index({ projectId: 1 });

const File: Model<IFile> = mongoose.models.File || mongoose.model<IFile>('File', FileSchema);
export default File;
