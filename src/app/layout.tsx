import SessionProviders from '@/components/Providers';
import ThemeProvider from '@/components/themes/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import { Inter } from 'next/font/google';
import { PageTransition } from '@/components/layout/PageTransition';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata = {
  title: 'PortalKit - Freelancer Client Portal',
  description: 'Manage projects, files, and invoices in one beautiful place.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <SessionProviders>
          <ThemeProvider>
            <PageTransition>
              {children}
            </PageTransition>
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </SessionProviders>
      </body>
    </html>
  );
}
