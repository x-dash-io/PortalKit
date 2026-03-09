import SessionProviders from '@/components/Providers';
import ThemeProvider from '@/components/themes/ThemeProvider';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import localFont from 'next/font/local';
import { PageTransition } from '@/components/layout/PageTransition';

const manrope = localFont({
  src: './fonts/Manrope-Variable.ttf',
  variable: '--font-manrope',
  weight: '200 800',
  display: 'swap',
});

const ibmPlexMono = localFont({
  src: './fonts/IBMPlexMono-Regular.ttf',
  variable: '--font-ibm-plex-mono',
  weight: '400',
  display: 'swap',
});

export const metadata = {
  title: 'PortalKit',
  description: 'Client portal infrastructure for modern freelance and studio operations.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.variable} ${ibmPlexMono.variable} font-sans antialiased`}>
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
