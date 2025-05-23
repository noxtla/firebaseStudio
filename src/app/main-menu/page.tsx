
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
// Separator removed as per new layout
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
      "block no-underline",
      isPrimary && "w-full" // Primary items take full width of their grid cell
    )}>
      <Card className={cn(
        "hover:bg-accent/50 transition-colors duration-150 ease-in-out cursor-pointer shadow-md hover:shadow-lg rounded-lg overflow-hidden flex",
        isPrimary && "h-full" // Primary items take full height of their grid cell
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
      
      {/* Main content area that grows */}
      <div className="w-full max-w-xl mx-auto flex-grow flex flex-col space-y-6 sm:space-y-8">
        {/* Primary Menu Items in a 2x2 Grid */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {primaryMenuItems.map((item) => (
            <MenuItem key={item.title} {...item} isPrimary />
          ))}
        </div>
      </div>

      {/* Footer area for secondary items */}
      <div className="w-full max-w-xl mx-auto mt-auto pt-8 flex flex-row justify-center items-start gap-6 sm:gap-8">
        {secondaryMenuItems.map((item) => (
          // Each secondary item will determine its own width based on content + padding
          <div key={item.title} className="flex-shrink-0"> 
            <MenuItem {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}
