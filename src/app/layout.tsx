import type { Metadata } from 'next';
import { Montserrat, Roboto } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '600', '700', '800'], // For regular, semibold, bold, extrabold
});

const roboto = Roboto({
  subsets: ['latin'],
  variable: '--font-roboto',
  weight: ['400', '500', '700'], // For regular, medium, bold
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
    <html lang="en" className={`${montserrat.variable} ${roboto.variable}`}>
      <body className={`antialiased`}> {/* Font family will be applied via globals.css */}
        <main> {/* Removed min-h-screen from here, individual pages/components will control height */}
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
