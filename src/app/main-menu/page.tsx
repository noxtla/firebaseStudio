
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import AppHeader from '@/components/app-header';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";


import {
  CalendarCheck,
  Car,
  ClipboardList,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  type LucideProps,
  Loader2,
  InfoIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemProps {
  icon: React.ElementType<LucideProps>;
  title: string;
  href?: string;
  onClick?: () => Promise<void>;
  isPrimary?: boolean;
  isLoading?: boolean;
  isDisabled?: boolean;
}

const MenuItem: FC<MenuItemProps> = ({ icon: Icon, title, href, onClick, isPrimary = true, isLoading = false, isDisabled = false }) => {
  const effectivelyDisabled = isDisabled || isLoading;

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
            : 'h-6 w-6 text-muted-foreground',
          effectivelyDisabled && !isLoading && "opacity-50" 
        )} />
      )}
      <span className={cn(
        "font-medium text-center text-card-foreground",
        isPrimary 
          ? "text-lg" 
          : "text-sm",
        effectivelyDisabled && "opacity-50"
      )}>{title}</span>
    </CardContent>
  );

  const cardClasses = cn(
    "hover:bg-accent/50 transition-colors duration-150 ease-in-out shadow-md hover:shadow-lg rounded-lg overflow-hidden flex flex-col", 
    isPrimary ? "h-full w-full" : "w-full" ,
    effectivelyDisabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"
  );

  if (onClick) {
    return (
      <div
        onClick={effectivelyDisabled ? undefined : onClick}
        className={cn(
          "flex",
          isPrimary ? "h-full w-full" : "w-full"
        )}
        role="button"
        tabIndex={effectivelyDisabled ? -1 : 0}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !effectivelyDisabled) {
            onClick();
          }
        }}
        aria-disabled={effectivelyDisabled}
      >
        <Card className={cardClasses}>
          {cardContent}
        </Card>
      </div>
    );
  }

  if (href) {
    return (
      <Link href={effectivelyDisabled ? "#" : href} passHref legacyBehavior aria-disabled={effectivelyDisabled}>
        <a className={cn(
          "no-underline flex",
          isPrimary ? "h-full w-full" : "w-full",
           effectivelyDisabled && "pointer-events-none" 
        )}>
          <Card className={cardClasses}>
            {cardContent}
          </Card>
        </a>
      </Link>
    );
  }

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
  // Removed isOutOfHoursAlertOpen and outOfHoursMessage state
  
  const [isAttendanceFeatureEnabled, setIsAttendanceFeatureEnabled] = useState(false);
  const [showDisabledAttendanceMessage, setShowDisabledAttendanceMessage] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loginStatus = sessionStorage.getItem('loginWebhookStatus');
      if (loginStatus === '210') {
        setIsAttendanceFeatureEnabled(true);
        setShowDisabledAttendanceMessage(false);
      } else {
        setIsAttendanceFeatureEnabled(false);
        setShowDisabledAttendanceMessage(true);
      }
    }
  }, []);

  const handleAttendanceClick = async () => {
    if (isAttendanceLoading || !isAttendanceFeatureEnabled) return;
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

      if (!response.ok) {
        // Simplified error handling: log the error status and text
        console.error("Attendance webhook call failed. Status:", response.status, "Body:", await response.text());
      } else {
        console.log("Webhook called successfully for Attendance.");
      }
    } catch (error) {
      console.error("Error calling webhook for Attendance:", error);
    }

    setIsAttendanceLoading(false);
    router.push('/attendance');
  };

  const primaryMenuItems: MenuItemProps[] = [
    { 
      icon: CalendarCheck, 
      title: "Attendance", 
      onClick: handleAttendanceClick, 
      isLoading: isAttendanceLoading,
      isDisabled: !isAttendanceFeatureEnabled, // Disable based on feature flag
    },
    { icon: Car, title: "Vehicles", href: "#vehicles" }, 
    { icon: ClipboardList, title: "Job Briefing", href: "#job-briefing" },
    { icon: ShieldCheck, title: "Safety", href: "#safety" },
  ];

  const secondaryMenuItems: MenuItemProps[] = [
    { icon: MessageSquare, title: "Support", href: "#support", isPrimary: false },
    { icon: AlertTriangle, title: "Emergency Support", href: "#emergency-support", isPrimary: false },
  ];

  return (
    <>
      {/* AlertDialog for "out of schedule" removed */}

      <div className="flex flex-col h-screen bg-background p-2">
        <AppHeader className="my-2" />

        {showDisabledAttendanceMessage && (
          <Alert variant="default" className="mb-4 mx-auto max-w-md border-primary/50 bg-primary/5">
            <InfoIcon className="h-5 w-5 text-primary" />
            <AlertTitle className="text-primary font-semibold">Attendance Unavailable</AlertTitle>
            <AlertDescription className="text-primary/90">
              Access is currently disabled. Registration is only available from 7:00 a.m. to 7:15 a.m.
            </AlertDescription>
          </Alert>
        )}

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
    </>
  );
}
