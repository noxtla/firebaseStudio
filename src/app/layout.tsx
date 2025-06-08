
"use client"; // Keep for other client-side logic if any, or remove if no longer needed.

import { Lato, Open_Sans } from 'next/font/google';
import './globals.css';
// Button import is removed as it's no longer used for language selection here.
import AppFooter from '@/components/app-footer'; // Import the AppFooter

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

// Metadata export removed as it's not allowed in client component layouts.
// Static title is set directly in the <head> below.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Language setting function is removed as buttons are removed.
  // const setLanguage = (lang: 'en' | 'es') => {
  //   if (typeof window !== 'undefined') {
  //     localStorage.setItem('preferredLang', lang);
  //     window.location.reload(); // Reload to apply language change
  //   }
  // };

  return (
    <html lang="en" className={`${lato.variable} ${openSans.variable}`}>
      <head>
        <title>Tree Services</title>
        {/* You can add other meta tags here if needed */}
      </head>
      <body className={`antialiased`}>
        {/* The div containing language buttons is removed. */}
        <main className="pb-20"> {/* Added padding-bottom for the footer */}
          {children}
        </main>
        <AppFooter /> {/* Add the AppFooter component here */}
      </body>
    </html>
  );
}
