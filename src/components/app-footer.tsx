"use client";

import Link from 'next/link';
import { Home, MessageSquare, User as UserIcon, Bell, Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { FOOTER_WEBHOOK_URL } from '@/config/appConfig';
import type { UserData } from '@/types';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

// MODIFICATION: Changed href for 'Chat'
const navItems: NavItem[] = [
  { href: '/main-menu', icon: Home, label: 'Home' },
  { href: '/chat', icon: MessageSquare, label: 'Chat' },
];

export default function AppFooter() {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();
  const [isNotifying, setIsNotifying] = useState(false);

  // Determine if the footer should be visible based on the current path
  // MODIFICATION: Hide footer on chat page for a better UI
  const hiddenPaths = ['/', '/chat'];
  if (hiddenPaths.includes(pathname)) {
    return null;
  }

  const handleNotificationClick = async () => {
    if (isNotifying) return;
    setIsNotifying(true);
    // --- DEBUG PATCH START ---
    console.log("[DEBUG] Notification fetch initiated.");
    // --- DEBUG PATCH END ---

    try {
      const storedUserData = sessionStorage.getItem('userData');
      if (!storedUserData) {
        toast({
          title: "Error",
          description: "User session not found. Please log in again.",
          variant: "destructive",
        });
        router.push('/');
        return;
      }

      const userData: UserData = JSON.parse(storedUserData);
      const phoneNumber = userData.phoneNumber;

      if (!phoneNumber) {
        toast({
          title: "Error",
          description: "Phone number not found in your session.",
          variant: "destructive",
        });
        return;
      }
      
      // --- CAMBIO AQUÍ ---
      // Limpiar el número de teléfono para enviar solo los dígitos
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, '');
      
      const url = new URL(FOOTER_WEBHOOK_URL);
      url.searchParams.append('action', 'notification');
      // Usar el número de teléfono limpio en la URL
      url.searchParams.append('phoneNumber', cleanPhoneNumber);

      // --- DEBUG PATCH START ---
      console.log(`[DEBUG] Fetching from URL: ${url.toString()}`);
      // --- DEBUG PATCH END ---

      const response = await fetch(url.toString(), {
        method: 'GET',
      });

      // --- DEBUG PATCH START ---
      console.log(`[DEBUG] Response status: ${response.status}`);
      // --- DEBUG PATCH END ---

      if (response.ok) {
        const notificationsData = await response.json();
        // --- DEBUG PATCH START ---
        console.log("[DEBUG] Raw data from webhook:", JSON.stringify(notificationsData, null, 2));
        // --- DEBUG PATCH END ---
        sessionStorage.setItem('notifications', JSON.stringify(notificationsData));
        router.push('/notifications');
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to retrieve notification data.' }));
        // --- DEBUG PATCH START ---
        console.error("[DEBUG] Error response from webhook:", errorData);
        // --- DEBUG PATCH END ---
        const errorMessage = errorData.message || "An unknown error occurred.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during notification GET request:", error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsNotifying(false);
    }
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background shadow-md">
      <nav className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.label} href={item.href} legacyBehavior>
              <a
                className={cn(
                  "flex flex-1 flex-col items-center justify-center p-2 text-muted-foreground transition-colors hover:text-primary",
                  isActive && "text-primary"
                )}
                aria-label={item.label}
              >
                <div className="relative">
                  <item.icon
                    className={cn("h-6 w-6 sm:h-7 sm:w-7", isActive ? "text-primary" : "")}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                </div>
              </a>
            </Link>
          );
        })}
         <div
          onClick={handleNotificationClick}
          className={cn(
            "flex flex-1 flex-col items-center justify-center p-2 text-muted-foreground transition-colors hover:text-primary cursor-pointer",
            pathname === "/notifications" && "text-primary",
            isNotifying && "pointer-events-none"
          )}
          aria-label="Notifications"
          role="button"
          tabIndex={0}
        >
          <div className="relative">
            {isNotifying ? (
              <Loader2 className={cn("h-6 w-6 sm:h-7 sm:w-7 animate-spin")} />
            ) : (
              <Bell
                className={cn("h-6 w-6 sm:h-7 sm:w-7", pathname === "/notifications" ? "text-primary" : "")}
                strokeWidth={pathname === "/notifications" ? 2.5 : 2}
              />
            )}
          </div>
        </div>
           <Link key="profile" href="/profile" legacyBehavior>
            <a
              className={cn(
                "flex flex-1 flex-col items-center justify-center p-2 text-muted-foreground transition-colors hover:text-primary",
                pathname === "/profile" && "text-primary"
              )}
              aria-label="Profile"
            >
              <div className="relative">
                <UserIcon
                  className={cn("h-6 w-6 sm:h-7 sm:w-7", pathname === "/profile" ? "text-primary" : "")}
                  strokeWidth={pathname === "/profile" ? 2.5 : 2}
                />
              </div>
            </a>
          </Link>
      </nav>
    </footer>
  );
}