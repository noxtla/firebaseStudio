
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import AppHeader from '@/components/app-header';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import {
  CalendarCheck,
  Car,
  ClipboardList,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  type LucideProps,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MenuItemProps {
  icon: React.ElementType<LucideProps>;
  title: string;
  href?: string;
  onClick?: () => Promise<void>;
  isPrimary?: boolean;
  isLoading?: boolean;
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
        onClick={isLoading ? undefined : onClick}
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
  const [isOutOfHoursAlertOpen, setIsOutOfHoursAlertOpen] = useState(false);
  const [outOfHoursMessage, setOutOfHoursMessage] = useState<string>("Attendance is currently unavailable. You are outside the allowed schedule.");

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

      if (!response.ok && response.status === 500) {
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            if (errorData && errorData.myField === "Fuera del horario") {
              setOutOfHoursMessage(errorData.myField);
              setIsOutOfHoursAlertOpen(true);
              setIsAttendanceLoading(false);
              return; // Prevent navigation
            }
          }
        } catch (e) {
          console.error("Failed to parse body of 500 error from attendance webhook:", e);
        }
        // If it's a 500 error but not the specific "Fuera del horario" JSON, or if parsing failed, log it.
        // The flow will proceed to navigation as per current broader error handling.
        console.error("Webhook call for Attendance returned 500, but not the 'Fuera del horario' condition or body parse failed. Status:", response.status);
      } else if (!response.ok) {
        // Handle other non-500 errors (e.g., 400, 401, 403, 404, etc.)
        console.error("Webhook call for Attendance failed:", response.status, await response.text());
      } else {
        // Response is OK
        console.log("Webhook called successfully for Attendance.");
      }
    } catch (error) {
      // Network errors or other issues with fetch itself
      console.error("Error calling webhook for Attendance:", error);
    }

    // This part is reached if the call was successful or if an error occurred that doesn't trigger the specific alert.
    setIsAttendanceLoading(false);
    router.push('/attendance');
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
    <>
      <AlertDialog open={isOutOfHoursAlertOpen} onOpenChange={setIsOutOfHoursAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Out of Schedule</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            {outOfHoursMessage}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsOutOfHoursAlertOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </>
  );
}
