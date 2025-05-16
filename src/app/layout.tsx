import type { Metadata } from 'next';
import { Shadows_Into_Light_Two, Open_Sans } from 'next/font/google';
import './globals.css';
// import { Toaster } from "@/components/ui/toaster"; // Toaster removed from here

const shadowsIntoLightTwo = Shadows_Into_Light_Two({
  subsets: ['latin'],
  variable: '--font-heading',
  weight: ['400'],
});

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '600', '800'],
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
        {/* <Toaster /> */} {/* Toaster removed from here */}
      </body>
    </html>
  );
}
