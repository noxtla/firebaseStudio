"use client";

import Link from 'next/link';
import { Home, MessageSquare, User as UserIcon, Bell, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { FOOTER_WEBHOOK_URL } from '@/config/appConfig';
import type { UserData } from '@/types';

// Helper function to get user data from session storage
const getUserDataFromSession = (): UserData | null => {
  if (typeof window === 'undefined') return null;
  const storedUserData = sessionStorage.getItem('userData');
  if (!storedUserData) return null;
  try {
    return JSON.parse(storedUserData);
  } catch (e) {
    console.error("Failed to parse user data from session", e);
    return null;
  }
};

export default function AppFooter() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  // Individual loading states for each icon
  const [isNotifying, setIsNotifying] = useState(false);
  const [isNavigatingChat, setIsNavigatingChat] = useState(false);
  const [isNavigatingProfile, setIsNavigatingProfile] = useState(false);

  // Paths where the footer should be hidden
  const hiddenPaths = ['/', '/chat'];
  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  // Unified POST handler for all footer actions
  const handlePostAction = async (
    action: 'message' | 'profile' | 'notification',
    path: string,
    setLoading: (loading: boolean) => void
  ) => {
    // Prevent multiple clicks while a request is in progress
    if (isNavigatingChat || isNotifying || isNavigatingProfile) return;
    setLoading(true);

    try {
      const userData = getUserDataFromSession();
      if (!userData || !userData.phoneNumber) {
        toast({
          title: "Error",
          description: "User session not found. Please log in again.",
          variant: "destructive",
        });
        router.push('/');
        return;
      }

      const cleanPhoneNumber = userData.phoneNumber.replace(/\D/g, '');

      // Send the webhook request with the action in the body
      const response = await fetch(FOOTER_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action,
          phoneNumber: cleanPhoneNumber,
          userData: userData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Action '${action}' failed with status ${response.status}.` }));
        throw new Error(errorData.message || "An unknown error occurred.");
      }

      // For notifications, we expect data back to store in the session
      if (action === 'notification') {
        const notificationsData = await response.json();
        sessionStorage.setItem('notifications', JSON.stringify(notificationsData));
      }

      // On success, navigate to the target page
      router.push(path);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unknown network error occurred.";
      console.error(`Error during '${action}' POST request:`, error);
      toast({
        title: "Webhook Error",
        description: errorMessage,
        variant: "destructive",
      });
      // IMPORTANT: Navigate anyway to not block user flow, even if the webhook fails
      router.push(path);
    } finally {
      // This might not run if navigation happens immediately, but it's good practice
      setLoading(false);
    }
  };

  // Define the footer items configuration for clean rendering
  const footerItems = [
    { label: 'Home', href: '/main-menu', icon: Home, isLoading: false, onClick: undefined },
    { label: 'Chat', href: '/chat', icon: MessageSquare, isLoading: isNavigatingChat, onClick: () => handlePostAction('message', '/chat', setIsNavigatingChat) },
    { label: 'Notifications', href: '/notifications', icon: Bell, isLoading: isNotifying, onClick: () => handlePostAction('notification', '/notifications', setIsNotifying) },
    { label: 'Profile', href: '/profile', icon: UserIcon, isLoading: isNavigatingProfile, onClick: () => handlePostAction('profile', '/profile', setIsNavigatingProfile) },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background shadow-md">
      <nav className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {footerItems.map((item) => {
          const isActive = pathname === item.href;
          const content = (
            <div className="relative">
              {item.isLoading ? (
                <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin" />
              ) : (
                <item.icon
                  className={cn("h-6 w-6 sm:h-7 sm:w-7", isActive && "text-primary")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              )}
            </div>
          );

          // Render a clickable div if an onClick handler is provided
          if (item.onClick) {
            return (
              <div
                key={item.label}
                onClick={item.onClick}
                className={cn(
                  "flex flex-1 flex-col items-center justify-center p-2 text-muted-foreground transition-colors hover:text-primary cursor-pointer",
                  isActive && "text-primary",
                  item.isLoading && "pointer-events-none"
                )}
                aria-label={item.label}
                role="button"
                tabIndex={0}
              >
                {content}
              </div>
            );
          }

          // Otherwise, render a standard Next.js Link for "Home"
          return (
            <Link key={item.label} href={item.href} legacyBehavior>
              <a
                className={cn(
                  "flex flex-1 flex-col items-center justify-center p-2 text-muted-foreground transition-colors hover:text-primary",
                  isActive && "text-primary"
                )}
                aria-label={item.label}
              >
                {content}
              </a>
            </Link>
          );
        })}
      </nav>
    </footer>
  );
}