"use client";

import { Lato, Open_Sans } from 'next/font/google';
import './globals.css';
import AppFooter from '@/components/app-footer';
import AppHeader from '@/components/app-header'; // Import the AppHeader
import { Toaster } from '@/components/ui/toaster'; // Import the Toaster

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '900'],
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '700', '800'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lato.variable} ${openSans.variable}`}>
      <head>
        <title>Tree Services</title>
      </head>
      <body className="antialiased">
        {/* The global header is now part of the root layout */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-20 items-center justify-center">
            <AppHeader />
          </div>
        </header>

        {/* The main content area is padded to account for the sticky header and fixed footer */}
        <main className="pt-8 pb-20">
          {children}
        </main>

        <AppFooter />
        <Toaster />
      </body>
    </html>
  );
}