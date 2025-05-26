import type { Metadata } from 'next';
import { Lato, Open_Sans } from 'next/font/google';
import './globals.css';
import { Button } from '@/components/ui/button'; // Import Button component

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '900'], // Load regular and black weights
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '700', '800'], // Load regular, bold, and extrabold weights
});

export const metadata: Metadata = {
  title: 'Tree Services',
  description: 'Secure login gateway.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${lato.variable} ${openSans.variable}`}>
      <body className={`antialiased`}>
        <div className="p-2 flex justify-end space-x-2 bg-background sticky top-0 z-50">
          <Button variant="outline" size="sm">
            Español
          </Button>
          <Button variant="outline" size="sm">
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
