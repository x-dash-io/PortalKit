import { NextAuthOptions, DefaultSession } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/mongodb';
import User from '@/lib/models/User';
import mongoose from 'mongoose';

// Extend the session type to include custom fields
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            theme: string;
            plan: string;
        } & DefaultSession['user'];
    }

    interface JWT {
        id: string;
        theme: string;
        plan: string;
    }
}

export const authOptions: NextAuthOptions = {
    adapter: MongoDBAdapter(
        connectDB().then((conn) => conn.connection.getClient() as any)
    ),
    session: {
        strategy: 'jwt',
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
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
                    theme: user.theme,
                    plan: user.plan,
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                // @ts-ignore
                token.theme = user.theme;
                // @ts-ignore
                token.plan = user.plan;
            }

            // Handle session updates (e.g. theme change)
            if (trigger === 'update' && session) {
                token.theme = session.theme;
            }

            return token;
        },
        async session({ session, token }) {
            if (token) {
                session.user.id = token.id as string;
                session.user.theme = token.theme as string;
                session.user.plan = token.plan as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
        error: '/auth/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
