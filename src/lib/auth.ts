import { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import { DEFAULT_EMAIL_PREFERENCES, DEFAULT_THEME, type AppTheme, type EmailPreferences, type UserPlan } from '@/lib/contracts';

const isDevelopment = process.env.NODE_ENV !== 'production';
const nextAuthSecret = process.env.NEXTAUTH_SECRET || (isDevelopment ? 'portalkit-local-dev-secret' : undefined);
const googleConfigured = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

// Extend the session type to include custom fields
declare module 'next-auth' {
    interface User {
        id?: string;
        theme?: AppTheme;
        plan?: UserPlan;
        emailPreferences?: EmailPreferences;
        avatar?: string;
        accentColor?: string;
    }

    interface Session {
        user: {
            id: string;
            theme: AppTheme;
            plan: UserPlan;
            emailPreferences: EmailPreferences;
            avatar?: string;
            accentColor?: string;
        } & DefaultSession['user'];
    }

}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
        theme?: AppTheme;
        plan?: UserPlan;
        emailPreferences?: EmailPreferences;
        avatar?: string;
        accentColor?: string;
    }
}

const mongoClientPromise = connectDB().then(
    (conn) => conn.connection.getClient() as unknown as import('mongodb').MongoClient
);

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(mongoClientPromise) as NextAuthOptions['adapter'],
    session: {
        strategy: 'jwt',
    },
    providers: [
        ...(googleConfigured
            ? [
                GoogleProvider({
                    clientId: process.env.GOOGLE_CLIENT_ID!,
                    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                }),
            ]
            : []),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter an email and password');
                }

                await connectDB();

                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user || !user.password) {
                    throw new Error('No user found with this email');
                }

                const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);

                if (!isPasswordCorrect) {
                    throw new Error('Invalid password');
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    theme: user.theme ?? DEFAULT_THEME,
                    plan: user.plan ?? 'free',
                    emailPreferences: user.emailPreferences ?? DEFAULT_EMAIL_PREFERENCES,
                    avatar: user.avatar,
                    accentColor: user.accentColor,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id ?? token.sub ?? '';
                token.theme = user.theme ?? DEFAULT_THEME;
                token.plan = user.plan ?? 'free';
                token.emailPreferences = user.emailPreferences ?? DEFAULT_EMAIL_PREFERENCES;
                token.avatar = typeof user.avatar === 'string' ? user.avatar : undefined;
                token.accentColor = typeof user.accentColor === 'string' ? user.accentColor : undefined;
            }

            if (trigger === 'update' && session?.user) {
                if (session.user.theme) token.theme = session.user.theme;
                if (session.user.plan) token.plan = session.user.plan;
                if (session.user.emailPreferences) token.emailPreferences = session.user.emailPreferences;
                if (typeof session.user.avatar === 'string') token.avatar = session.user.avatar;
                if (typeof session.user.accentColor === 'string') token.accentColor = session.user.accentColor;
            }

            return token;
        },
        async session({ session, token }) {
            session.user.id = typeof token.id === 'string' ? token.id : '';
            session.user.theme = (token.theme as AppTheme | undefined) ?? DEFAULT_THEME;
            session.user.plan = (token.plan as UserPlan | undefined) ?? 'free';
            session.user.emailPreferences =
                (token.emailPreferences as EmailPreferences | undefined) ?? DEFAULT_EMAIL_PREFERENCES;
            session.user.avatar = typeof token.avatar === 'string' ? token.avatar : undefined;
            session.user.accentColor = typeof token.accentColor === 'string' ? token.accentColor : undefined;
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/login',
    },
    secret: nextAuthSecret,
};
