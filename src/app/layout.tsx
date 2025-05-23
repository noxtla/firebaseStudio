import type { Metadata } from 'next';
import { Lato, Open_Sans } from 'next/font/google';
import './globals.css';
// import { Toaster } from "@/components/ui/toaster"; // Toaster moved from here

const lato = Lato({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400', '900'], // Load regular and black weights
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '700'], // Load regular and bold weights
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
        <main>
          {children}
        </main>
        {/* <Toaster /> */} {/* Toaster moved from here */}
      </body>
    </html>
  );
}
