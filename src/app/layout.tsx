"use client";

import { Lato, Open_Sans } from 'next/font/google';
import './globals.css';
import AppFooter from '@/components/app-footer';
import AppHeader from '@/components/app-header'; // Import the AppHeader
import { Toaster } from '@/components/ui/toaster'; // Import the Toaster
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Camera } from 'lucide-react';

// --- NEW IMPORTS ---
import { useInactivityTimeout } from '@/hooks/useInactivityTimeout';
import { SessionTimeoutDialog } from '@/components/session-timeout-dialog';
import { useToast } from '@/hooks/use-toast';
// --- END NEW IMPORTS ---

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
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  // --- LOGIC FOR INACTIVITY TIMEOUT ---
  const handleLogout = () => {
    // Clear session-related data
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
    // Redirect to login page with a toast message
    router.push('/');
    toast({
      title: "Session Expired",
      description: "Your session has expired due to inactivity. Please log in again.",
      variant: "destructive",
    });
  };

  const { showWarning, countdown, extendSession } = useInactivityTimeout(handleLogout);
  // --- END LOGIC ---

  // Paths where the camera icon should NOT be displayed
  const hideCameraOnPaths = [
    '/', // Initial login/welcome screen
    '/attendance', // During the multi-step attendance form
    '/scan', // The scanner page itself
  ];
  
  // Corrected logic: Check for exact match on '/' and startsWith for others.
  const showCameraIcon = !hideCameraOnPaths.some(path => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  });

  return (
    <html lang="en" className={`${lato.variable} ${openSans.variable}`}>
      <head>
        <title>Tree Services</title>
      </head>
      <body className="antialiased">
        {/* The global header is now part of the root layout */}
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container flex h-20 items-center justify-center">
            <div className="flex items-center gap-2">
              <Link href="/main-menu" className="no-underline">
                <AppHeader />
              </Link>
              {showCameraIcon && (
                <Link href="/scan" passHref>
                  {/* --- MODIFIED: Adjusted size and color of the camera button --- */}
                  <Button variant="ghost" size="icon" aria-label="Open scanner" className="h-12 w-12">
                    <Camera className="h-8 w-8 text-blue-600" />
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* The main content area is padded to account for the sticky header and fixed footer */}
        <main className="pt-8 pb-20">
          {children}
        </main>
        
        {/* --- COMPONENT FOR TIMEOUT DIALOG --- */}
        <SessionTimeoutDialog
          isOpen={showWarning}
          countdown={countdown}
          onExtend={extendSession}
          onLogout={handleLogout}
        />
        {/* --- END COMPONENT --- */}

        <AppFooter />
        <Toaster />
      </body>
    </html>
  );
}