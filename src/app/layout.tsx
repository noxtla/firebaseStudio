import type { Metadata } from 'next';
import { Shadows_Into_Light_Two, Open_Sans } from 'next/font/google'; // Changed Poppins to Shadows_Into_Light_Two
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const shadowsIntoLightTwo = Shadows_Into_Light_Two({ // Changed font
  subsets: ['latin'],
  variable: '--font-heading', // Kept variable name
  weight: ['400'], // Shadows Into Light Two typically only has a regular weight
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '600'],
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
    <html lang="en" className={`${shadowsIntoLightTwo.variable} ${openSans.variable}`}>
      <body className={`antialiased`}>
        <main>
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
