import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
    email: string;
    name: string;
    password?: string;
    avatar?: string;
    logo?: string;
    accentColor?: string;
    theme: 'frost' | 'obsidian' | 'aurora';
    plan: 'free' | 'pro';
    storageUsed: number;
    lastInvoiceNumber: number;
    emailPreferences: {
        invoiceViewed: boolean;
        approvalResponded: boolean;
        portalVisited: boolean;
        overdueReminders: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        password: { type: String },
        avatar: { type: String },
        logo: { type: String },
        accentColor: { type: String },
        theme: { type: String, enum: ['frost', 'obsidian', 'aurora'], default: 'frost' },
        plan: { type: String, enum: ['free', 'pro'], default: 'free' },
        storageUsed: { type: Number, default: 0 },
        lastInvoiceNumber: { type: Number, default: 0 },
        emailPreferences: {
            invoiceViewed: { type: Boolean, default: true },
            approvalResponded: { type: Boolean, default: true },
            portalVisited: { type: Boolean, default: false },
            overdueReminders: { type: Boolean, default: true },
        },
    },
    { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
