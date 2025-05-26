
"use client"; // Make it a client component for button onClick

import { Lato, Open_Sans } from 'next/font/google';
import './globals.css';
import { Button } from '@/components/ui/button';

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
  const setLanguage = (lang: 'en' | 'es') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferredLang', lang);
      window.location.reload(); // Reload to apply language change
    }
  };

  return (
    <html lang="en" className={`${lato.variable} ${openSans.variable}`}>
      <head>
        <title>Tree Services</title>
        {/* You can add other meta tags here if needed */}
      </head>
      <body className={`antialiased`}>
        <div className="p-2 flex justify-end space-x-2 bg-background sticky top-0 z-50">
          <Button variant="outline" size="sm" onClick={() => setLanguage('es')}>
            Español
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLanguage('en')}>
            English
          </Button>
        </div>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
