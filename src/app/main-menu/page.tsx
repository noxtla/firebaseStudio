"use client";

import { useState, type FC, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Truck,
  ClipboardList,
  ShieldCheck,
  MessageSquare,
  AlertTriangle as AlertTriangleIcon,
  type LucideIcon,
  Loader2,
  BookHeart, // Icon for Safety
  Wrench,
} from 'lucide-react';
import AppHeader from '@/components/app-header';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import type { UserData } from '@/types';

interface MenuItemProps {
  title: string;
  icon: LucideIcon;
  href?: string;
  isPrimary?: boolean;
  onClick?: () => Promise<void> | void;
  isDisabled?: boolean;
  isLoading?: boolean;
}

const MenuItem: FC<MenuItemProps> = ({ title, icon: Icon, href, isPrimary = true, onClick, isDisabled, isLoading }) => {
  const content = (
    <Card
      className={cn(
        "w-full flex flex-col items-center justify-center transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg border-none shadow-none",
        isPrimary ? "bg-card p-4 sm:p-6 h-full" : "bg-secondary p-3",
        (isDisabled || isLoading) && "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none",
        isLoading && "cursor-wait"
      )}
    >
      <CardContent className={cn(
        "flex-1 flex flex-col items-center justify-center text-center gap-2",
        isPrimary ? "space-y-2 sm:space-y-3" : "space-y-1.5",
        "p-0"
      )}>
        {isLoading ? (
          <Loader2 className={cn("animate-spin text-primary", isPrimary ? "h-10 w-10 sm:h-12 sm:w-12" : "h-6 w-6")} />
        ) : (
          <Icon className={cn("text-primary", isPrimary ? "h-10 w-10 sm:h-12 sm:w-12" : "h-6 w-6")} />
        )}
        <p className={cn("font-medium text-foreground", isPrimary ? "text-base sm:text-lg" : "text-sm")}>{title}</p>
      </CardContent>
    </Card>
  );

  const handleClick = (e: React.MouseEvent) => {
    if (isDisabled || isLoading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      e.preventDefault();
      onClick();
    }
  };

  if (href && !onClick && !isDisabled && !isLoading) {
    return (
      <Link href={href} passHref legacyBehavior>
        <a className="flex h-full w-full">
          {content}
        </a>
      </Link>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn("flex h-full w-full cursor-pointer", isDisabled || isLoading ? "pointer-events-none" : "")}
      role="button"
      tabIndex={isDisabled || isLoading ? -1 : 0}
      aria-disabled={isDisabled || isLoading}
    >
      {content}
    </div>
  );
};

export default function MainMenuPage() {
  const router = useRouter();

  useEffect(() => {
    // Check if userData exists in sessionStorage
    if (typeof window !== 'undefined') {
      const userData = sessionStorage.getItem('userData');
      if (!userData) {
        // If not, redirect to the login page
        router.push('/');
      }
    }
  }, [router]);

  const primaryMenuItems: MenuItemProps[] = [
    { title: 'Attendance', icon: Users, href: '/attendance' },
    { title: 'Vehicles', icon: Truck, href: '/vehicles/enter-truck-number', isDisabled: false },
    { title: 'Job Briefing', icon: ClipboardList, href: '/job-briefing', isDisabled: false },
    { title: 'Safety', icon: BookHeart, href: '/safety/modules', isDisabled: false },
  ];

  const secondaryMenuItems: MenuItemProps[] = [
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background p-2 sm:p-4">
      <Toaster />
      <AppHeader className="my-2 sm:my-4" />

      <div className="w-full flex-1 flex flex-col items-center justify-center">
        <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-4 w-full h-full max-w-xl p-2">
          {primaryMenuItems.map((item) => (
            <div key={item.title} className="flex">
              <MenuItem {...item} />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full mt-auto pt-4 sm:pt-6 pb-2 flex flex-row justify-center items-center gap-2 sm:gap-4">
        {secondaryMenuItems.map((item) => (
          <div key={item.title} className="flex-1 max-w-[200px] sm:max-w-[240px]">
            <MenuItem {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}
