import mongoose, { Schema, Document, Model } from 'mongoose';
import { APP_THEMES, DEFAULT_EMAIL_PREFERENCES, USER_PLANS } from '@/lib/contracts';

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
        theme: { type: String, enum: APP_THEMES, default: 'frost' },
        plan: { type: String, enum: USER_PLANS, default: 'free' },
        storageUsed: { type: Number, default: 0 },
        lastInvoiceNumber: { type: Number, default: 0 },
        emailPreferences: {
            invoiceViewed: { type: Boolean, default: DEFAULT_EMAIL_PREFERENCES.invoiceViewed },
            approvalResponded: { type: Boolean, default: DEFAULT_EMAIL_PREFERENCES.approvalResponded },
            portalVisited: { type: Boolean, default: DEFAULT_EMAIL_PREFERENCES.portalVisited },
            overdueReminders: { type: Boolean, default: DEFAULT_EMAIL_PREFERENCES.overdueReminders },
        },
    },
    { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
