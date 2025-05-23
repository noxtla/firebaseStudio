
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
      "no-underline flex",
      isPrimary ? "h-full w-full" : "w-full" 
    )}>
      <Card className={cn(
        "hover:bg-accent/50 transition-colors duration-150 ease-in-out cursor-pointer shadow-md hover:shadow-lg rounded-lg overflow-hidden flex flex-col", 
        isPrimary ? "h-full w-full" : "w-full" 
      )}>
        <CardContent className={cn(
          "flex flex-col items-center justify-center flex-1", // flex-1 to make content fill card
          isPrimary 
            ? "p-4 space-y-3" 
            : "p-3 space-y-1.5" 
        )}>
          <Icon className={cn(
            isPrimary 
              ? 'h-10 w-10 text-primary' 
              : 'h-6 w-6 text-muted-foreground' 
          )} />
          <span className={cn(
            "font-medium text-center text-card-foreground",
            isPrimary 
              ? "text-lg" 
              : "text-sm" 
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
    <div className="flex flex-col h-screen bg-background p-2"> {/* Use h-screen for full viewport height, minimal padding */}
      <AppHeader className="my-2" /> {/* Minimal vertical margin */}

      {/* Primary Menu Items - this grid should expand to fill most of the space */}
      <div className="grid grid-cols-2 gap-2 flex-1 overflow-hidden"> {/* flex-1 to grow, gap-2 for tighter cards, overflow-hidden for safety */}
        {primaryMenuItems.map((item) => (
          <div key={item.title} className="flex"> {/* Make grid cell a flex container */}
            <MenuItem {...item} isPrimary /> {/* MenuItem will expand to fill this flex cell */}
          </div>
        ))}
      </div>

      {/* Footer area for secondary items */}
      <div className="w-full py-2 mt-2 flex flex-row gap-2"> {/* Minimal padding and margin, items share width */}
        {secondaryMenuItems.map((item) => (
          <div key={item.title} className="flex-1 min-w-0"> {/* flex-1 to share space */}
            <MenuItem {...item} isPrimary={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
