"use client";

import Link from 'next/link';
import { Home, MessageSquare, User as UserIcon } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import NotificationCenter from './notification-center';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

const navItems: NavItem[] = [
  { href: '/main-menu', icon: Home, label: 'Home' },
  { href: '#', icon: MessageSquare, label: 'Chat' }, // Placeholder href
  { href: '#', icon: UserIcon, label: 'Profile' }, // Placeholder href
];

export default function AppFooter() {
  const pathname = usePathname();

  // Determine if the footer should be visible based on the current path
  const hiddenPaths = ['/']; // Removed '/attendance' from here
  if (hiddenPaths.includes(pathname)) {
    return null;
  }

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
        <NotificationCenter />
      </nav>
    </footer>
  );
}
