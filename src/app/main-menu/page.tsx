
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import AppHeader from '@/components/app-header'; // Re-use the header

// Lucide icons
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
    <a className="block w-full no-underline">
      <Card className={cn(
        "hover:bg-accent/50 transition-colors duration-150 ease-in-out cursor-pointer shadow-md hover:shadow-lg rounded-lg overflow-hidden h-full flex",
        isPrimary ? "bg-card" : "bg-card" // Can differentiate later if needed
      )}>
        <CardContent className="flex flex-col items-center justify-center p-4 sm:p-6 space-y-2 sm:space-y-3 w-full">
          <Icon className={cn("h-8 w-8 sm:h-10 sm:w-10", isPrimary ? 'text-primary' : 'text-muted-foreground')} />
          <span className="text-base sm:text-lg font-medium text-center text-card-foreground">{title}</span>
        </CardContent>
      </Card>
    </a>
  </Link>
);

export default function MainMenuPage() {
  const primaryMenuItems: MenuItemProps[] = [
    { icon: CalendarCheck, title: "Attendance", href: "#attendance" }, // Placeholder href
    { icon: Car, title: "Vehicles", href: "#vehicles" },
    { icon: ClipboardList, title: "Job Briefing", href: "#job-briefing" },
    { icon: ShieldCheck, title: "Safety", href: "#safety" },
  ];

  const secondaryMenuItems: MenuItemProps[] = [
    { icon: MessageSquare, title: "Support", href: "#support" },
    { icon: AlertTriangle, title: "Emergency Support", href: "#emergency-support" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background items-center p-4 pb-8 sm:p-6">
      <AppHeader className="mt-8 mb-6 sm:mb-8" />
      
      <div className="w-full max-w-xl mx-auto space-y-6 sm:space-y-8">
        {/* Primary Options */}
        <div className="grid grid-cols-2 gap-4 sm:gap-6">
          {primaryMenuItems.map((item) => (
            <MenuItem key={item.title} {...item} isPrimary />
          ))}
        </div>

        <Separator className="my-6 sm:my-8" />

        {/* Secondary Options */}
        <div className="space-y-4 sm:space-y-6">
          {secondaryMenuItems.map((item) => (
            <MenuItem key={item.title} {...item} isPrimary={false} />
          ))}
        </div>
      </div>
    </div>
  );
}
