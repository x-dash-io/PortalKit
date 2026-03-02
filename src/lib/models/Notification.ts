import mongoose, { Schema, Document, Model, Types } from 'mongoose';

export interface INotification extends Document {
    freelancerId: Types.ObjectId;
    type: string;
    projectId?: Types.ObjectId;
    read: boolean;
    metadata?: Record<string, any>;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
    {
        freelancerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        type: { type: String, required: true },
        projectId: { type: Schema.Types.ObjectId, ref: 'Project' },
        read: { type: Boolean, default: false },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

NotificationSchema.index({ freelancerId: 1, read: 1 });

const Notification: Model<INotification> =
    mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
