
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  Users, 
  Car, 
  ClipboardList, 
  ShieldCheck, 
  MessageSquare, 
  AlertTriangle as AlertTriangleIcon, 
  type LucideIcon, 
  Loader2 
} from 'lucide-react';
import AppHeader from '@/components/app-header';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardHeader, CardTitle
import { Button } from '@/components/ui/button';
// import { Separator } from '@/components/ui/separator'; // No longer needed
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
// import { Alert, AlertDescription as AlertDescUi, AlertTitle as AlertTitleUi } from "@/components/ui/alert"; // No longer needed

interface MenuItemProps {
  title: string;
  icon: LucideIcon;
  href?: string;
  isPrimary?: boolean;
  onClick?: () => Promise<void>;
  isDisabled?: boolean;
  isLoading?: boolean;
}

const MenuItem: FC<MenuItemProps> = ({ title, icon: Icon, href, isPrimary = true, onClick, isDisabled, isLoading }) => {
  const content = (
    <Card 
      className={cn(
        "w-full flex flex-col items-center justify-center transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg border-none shadow-none",
        isPrimary ? "bg-card p-4 sm:p-6 h-full" : "bg-secondary p-3",
        isDisabled && "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none",
        isLoading && "cursor-wait"
      )}
    >
      <CardContent className={cn(
        "flex-1 flex flex-col items-center justify-center text-center gap-2", // Added flex-1
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

  const handleClick = async (e: React.MouseEvent) => {
    if (isDisabled || isLoading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      e.preventDefault(); 
      await onClick();
    }
  };

  if (href && !onClick) {
    return (
      <Link href={isDisabled || isLoading ? "#" : href} passHref legacyBehavior>
        <a 
          className={cn("flex h-full w-full", isDisabled || isLoading ? "pointer-events-none" : "")} //Ensure anchor takes full space
          onClick={isDisabled || isLoading ? (e) => e.preventDefault() : undefined}
          aria-disabled={isDisabled || isLoading}
        >
          {content}
        </a>
      </Link>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn("flex h-full w-full cursor-pointer", isDisabled || isLoading ? "pointer-events-none" : "")} //Ensure div takes full space
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
  const [isAttendanceLoading, setIsAttendanceLoading] = useState(false);
  const [isOutOfHoursAlertOpen, setIsOutOfHoursAlertOpen] = useState(false);
  const [outOfHoursMessage, setOutOfHoursMessage] = useState("");
  const [isLoadingMenu, setIsLoadingMenu] = useState(false); // Default to false, no sessionStorage check needed now for this

  // Removed: isAttendanceFeatureEnabled, showDisabledAttendanceMessage states and related useEffect


  const handleAttendanceClick = async () => {
    setIsAttendanceLoading(true);
    setOutOfHoursMessage("");
    try {
      const response = await fetch('https://n8n.srv809556.hstgr.cloud/webhook-test/attendence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'attendance_clicked' }),
      });
      
      if (!response.ok) {
        if (response.status === 500) {
            try {
                const errorData = await response.json();
                if (errorData && errorData.myField === "Fuera del horario") {
                    setOutOfHoursMessage("Attendance is currently outside of allowed hours. Please try again later.");
                    setIsOutOfHoursAlertOpen(true);
                } else {
                  console.error('Attendance webhook error:', response.status, errorData);
                }
            } catch (e) {
                console.error('Attendance webhook error, could not parse JSON:', response.status, await response.text());
            }
        } else {
          console.error('Attendance webhook call failed:', response.status, await response.text());
        }
      }
    } catch (error) {
      console.error('Error calling attendance webhook:', error);
    } finally {
      setIsAttendanceLoading(false);
      router.push('/attendance'); 
    }
  };

  const primaryMenuItems: MenuItemProps[] = [
    { title: 'Attendance', icon: Users, onClick: handleAttendanceClick, isLoading: isAttendanceLoading, isDisabled: isAttendanceLoading }, // isDisabled only depends on its own loading state
    { title: 'Vehicles', icon: Car, href: '#' , isDisabled: false}, 
    { title: 'Job Briefing', icon: ClipboardList, href: '#', isDisabled: false },
    { title: 'Safety', icon: ShieldCheck, href: '#', isDisabled: false },
  ];

  const secondaryMenuItems: MenuItemProps[] = [
    { title: 'Support', icon: MessageSquare, href: '#', isPrimary: false, isDisabled: false },
    { title: 'Emergency Support', icon: AlertTriangleIcon, href: '#', isPrimary: false, isDisabled: false },
  ];
  
  if (isLoadingMenu) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading menu...</p>
      </div>
    );
  }


  return (
    <div className="flex flex-col min-h-screen bg-background p-2 sm:p-4">
      <Toaster />
      <AlertDialog open={isOutOfHoursAlertOpen} onOpenChange={setIsOutOfHoursAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Out of Schedule</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            {outOfHoursMessage || "Attendance recording is currently outside of allowed hours."}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsOutOfHoursAlertOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AppHeader className="my-2 sm:my-4" /> 
      
      {/* Removed conditional Alert for "Access Information" */}


      <div className="w-full flex-1 flex flex-col items-center justify-center"> {/* Main content area */}
        <div className="grid grid-cols-2 grid-rows-2 gap-2 sm:gap-4 w-full h-full max-w-xl p-2"> {/* Primary items grid */}
          {primaryMenuItems.map((item) => (
            <div key={item.title} className="flex"> 
              <MenuItem {...item} />
            </div>
          ))}
        </div>
      </div>

      <div className="w-full mt-auto pt-4 sm:pt-6 pb-2 flex flex-row justify-center items-center gap-2 sm:gap-4"> {/* Footer for secondary items */}
        {secondaryMenuItems.map((item) => (
          <div key={item.title} className="flex-1 max-w-[200px] sm:max-w-[240px]"> 
            <MenuItem {...item} />
          </div>
        ))}
      </div>
    </div>
  );
}
