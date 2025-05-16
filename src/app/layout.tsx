import type { Metadata } from 'next';
import { Poppins, Open_Sans } from 'next/font/google'; // Changed imports
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const poppins = Poppins({ // Changed font
  subsets: ['latin'],
  variable: '--font-heading', // Changed variable name
  weight: ['600', '700', '800'], // Semibold, Bold, ExtraBold
});

const openSans = Open_Sans({ // Changed font
  subsets: ['latin'],
  variable: '--font-body', // Changed variable name
  weight: ['400', '600'], // Regular, Semibold (for a slightly bolder body option if needed)
});

export const metadata: Metadata = {
  title: 'Asplundh Access',
  description: 'Secure login gateway for Asplundh agents.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${openSans.variable}`}>
      <body className={`antialiased`}>
        <main>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
