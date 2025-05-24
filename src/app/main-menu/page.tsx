
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // Added for programmatic navigation
import { useState } from 'react'; // Added, though not used in this simplified version
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
  Loader2, // For potential loading state
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemProps {
  icon: React.ElementType<LucideProps>;
  title: string;
  href?: string; // Optional: used if onClick is not provided
  onClick?: () => Promise<void>; // Optional: used for custom actions
  isPrimary?: boolean;
  isLoading?: boolean; // Optional: for visual feedback
}

const MenuItem: FC<MenuItemProps> = ({ icon: Icon, title, href, onClick, isPrimary = true, isLoading = false }) => {
  const cardContent = (
    <CardContent className={cn(
      "flex flex-col items-center justify-center flex-1",
      isPrimary 
        ? "p-4 space-y-3" 
        : "p-3 space-y-1.5" 
    )}>
      {isLoading ? (
        <Loader2 className={cn("animate-spin", isPrimary ? 'h-10 w-10 text-primary' : 'h-6 w-6 text-muted-foreground')} />
      ) : (
        <Icon className={cn(
          isPrimary 
            ? 'h-10 w-10 text-primary' 
            : 'h-6 w-6 text-muted-foreground' 
        )} />
      )}
      <span className={cn(
        "font-medium text-center text-card-foreground",
        isPrimary 
          ? "text-lg" 
          : "text-sm" 
      )}>{title}</span>
    </CardContent>
  );

  const cardClasses = cn(
    "hover:bg-accent/50 transition-colors duration-150 ease-in-out shadow-md hover:shadow-lg rounded-lg overflow-hidden flex flex-col", 
    isPrimary ? "h-full w-full" : "w-full" ,
    isLoading ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
  );

  if (onClick) {
    return (
      <div
        onClick={isLoading ? undefined : onClick} // Prevent click while loading
        className={cn(
          "flex",
          isPrimary ? "h-full w-full" : "w-full"
        )}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
            onClick();
          }
        }}
      >
        <Card className={cardClasses}>
          {cardContent}
        </Card>
      </div>
    );
  }

  if (href) {
    return (
      <Link href={href} passHref legacyBehavior>
        <a className={cn(
          "no-underline flex",
          isPrimary ? "h-full w-full" : "w-full" 
        )}>
          <Card className={cardClasses}>
            {cardContent}
          </Card>
        </a>
      </Link>
    );
  }

  // Fallback if neither href nor onClick is provided (should not happen with proper config)
  return (
    <div className={cn("flex", isPrimary ? "h-full w-full" : "w-full")}>
      <Card className={cn(cardClasses, "opacity-50")}>
        {cardContent}
         <span className="text-xs text-destructive-foreground p-1 text-center">Misconfigured</span>
      </Card>
    </div>
  );
};

export default function MainMenuPage() {
  const router = useRouter();
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);

  const handleAttendanceClick = async () => {
    if (isAttendanceLoading) return;
    setIsAttendanceLoading(true);
    console.log("Attendance clicked, calling webhook...");
    try {
      const response = await fetch('https://n8n.srv809556.hstgr.cloud/webhook-test/attendence', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: "attendance_clicked" }),
      });
      if (response.ok) {
        console.log("Webhook called successfully for Attendance.");
      } else {
        console.error("Webhook call for Attendance failed:", response.status, await response.text());
      }
    } catch (error) {
      console.error("Error calling webhook for Attendance:", error);
    } finally {
      setIsAttendanceLoading(false);
      router.push('/attendance');
    }
  };

  const primaryMenuItems: MenuItemProps[] = [
    { icon: CalendarCheck, title: "Attendance", onClick: handleAttendanceClick, isLoading: isAttendanceLoading },
    { icon: Car, title: "Vehicles", href: "#vehicles" }, 
    { icon: ClipboardList, title: "Job Briefing", href: "#job-briefing" },
    { icon: ShieldCheck, title: "Safety", href: "#safety" },
  ];

  const secondaryMenuItems: MenuItemProps[] = [
    { icon: MessageSquare, title: "Support", href: "#support", isPrimary: false },
    { icon: AlertTriangle, title: "Emergency Support", href: "#emergency-support", isPrimary: false },
  ];

  return (
    <div className="flex flex-col h-screen bg-background p-2">
      <AppHeader className="my-2" />

      <div className="grid grid-cols-2 gap-2 flex-1 overflow-hidden">
        {primaryMenuItems.map((item) => (
          <div key={item.title} className="flex">
            <MenuItem {...item} isPrimary />
          </div>
        ))}
      </div>

      <div className="w-full py-2 mt-2 flex flex-row gap-2">
        {secondaryMenuItems.map((item) => (
          <div key={item.title} className="flex-1 min-w-0">
            <MenuItem {...item} isPrimary={false} />
          </div>
        ))}
      </div>
    </div>
  );
}
