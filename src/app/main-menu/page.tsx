
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import AppHeader from '@/components/app-header'; 

import {
  CalendarCheck,
  Car,
  ClipboardList,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  type LucideProps,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemProps {
  icon: React.ElementType<LucideProps>;
  title: string;
  href: string; 
  isPrimary?: boolean;
}

const MenuItem: FC<MenuItemProps> = ({ icon: Icon, title, href, isPrimary = true }) => (
  <Link href={href} passHref legacyBehavior>
    <a className={cn(
      "block no-underline w-full", // Apply w-full to the anchor for both primary and secondary
    )}>
      <Card className={cn(
        "hover:bg-accent/50 transition-colors duration-150 ease-in-out cursor-pointer shadow-md hover:shadow-lg rounded-lg overflow-hidden flex w-full", // Apply w-full to Card
        isPrimary ? "h-full" : "h-auto" // Primary items take full height, secondary auto
      )}>
        <CardContent className={cn(
          "flex flex-col items-center justify-center w-full",
          isPrimary 
            ? "p-4 sm:p-6 space-y-2 sm:space-y-3" 
            : "p-3 space-y-1.5" // Secondary: More compact padding and spacing
        )}>
          <Icon className={cn(
            isPrimary 
              ? 'h-8 w-8 sm:h-10 sm:w-10 text-primary' 
              : 'h-6 w-6 text-muted-foreground' // Secondary: Smaller icon
          )} />
          <span className={cn(
            "font-medium text-center text-card-foreground",
            isPrimary 
              ? "text-base sm:text-lg" 
              : "text-sm" // Secondary: Smaller text
          )}>{title}</span>
        </CardContent>
      </Card>
    </a>
  </Link>
);

export default function MainMenuPage() {
  const primaryMenuItems: MenuItemProps[] = [
    { icon: CalendarCheck, title: "Attendance", href: "/attendance" },
    { icon: Car, title: "Vehicles", href: "#vehicles" }, 
    { icon: ClipboardList, title: "Job Briefing", href: "#job-briefing" },
    { icon: ShieldCheck, title: "Safety", href: "#safety" },
  ];

  const secondaryMenuItems: MenuItemProps[] = [
    { icon: MessageSquare, title: "Support", href: "#support", isPrimary: false },
    { icon: AlertTriangle, title: "Emergency Support", href: "#emergency-support", isPrimary: false },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background items-center p-4 pb-8 sm:p-6">
      <AppHeader className="mt-8 mb-6 sm:mb-8" />
      
      {/* Main content area that grows to fill space */}
      <div className="w-full max-w-xl mx-auto flex-grow flex flex-col">
        {/* Primary Menu Items in a 2x2 Grid - this grid should fill the flex-grow parent */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6 flex-grow">
          {primaryMenuItems.map((item) => (
            <div key={item.title} className="h-full"> {/* Ensure grid item takes full height */}
              <MenuItem {...item} isPrimary />
            </div>
          ))}
        </div>
      </div>

      {/* Footer area for secondary items, pushed to bottom */}
      <div className="w-full max-w-xl mx-auto mt-auto pt-8 flex flex-row justify-center items-start gap-4 sm:gap-6">
        {secondaryMenuItems.map((item) => (
          <div key={item.title} className="flex-1 min-w-0"> {/* flex-1 to share space, min-w-0 for proper flex shrinking */}
            <MenuItem {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}
