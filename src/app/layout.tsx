import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

import { headers } from 'next/headers';
import ContextProvider from '@/../context';
import { Toaster } from '@/components/ui/toaster';
import Navigation from '@/components/navigation';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Movement Labs',
  description: 'Wallet Registration - by Morgan Selbekk',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersObj = await headers();
  const cookies = headersObj.get('cookie');

  return (
    <html lang='en' className='dark'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ContextProvider cookies={cookies}>
          <Navigation />
          <main className='h-[90vh]'>{children}</main>
        </ContextProvider>
        <Toaster />
      </body>
    </html>
  );
}

// The App loads the layout.tsx file which serves as the root layout and consists of
// my header where I include the logo
// a main element that wraps all child pages
