
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
import { Card, CardContent } from '@/components/ui/card';
// Button import removed as it's not directly used in MenuItem props anymore for this specific page's use case
// import { Button } from '@/components/ui/button'; 
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
// Toaster and useToast removed as they are no longer used on this page
// import { Toaster } from "@/components/ui/toaster";
// import { useToast } from "@/hooks/use-toast"; 
import {
  AlertDialog, // Kept in case other menu items might need it in the future, but not used now
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription as AlertDescUi, AlertTitle as AlertTitleUi } from "@/components/ui/alert";


interface MenuItemProps {
  title: string;
  icon: LucideIcon;
  href?: string;
  isPrimary?: boolean;
  onClick?: () => void; // Changed from Promise<void> to void as it might not be async
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

  const handleClick = async (e: React.MouseEvent) => {
    if (isDisabled || isLoading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      e.preventDefault(); 
      // onClick might not be async, await is fine but not strictly necessary if all onClicks are sync
      onClick(); 
    }
  };

  if (href && !onClick) {
    return (
      <Link href={isDisabled || isLoading ? "#" : href} passHref legacyBehavior>
        <a 
          className={cn("flex h-full w-full", isDisabled || isLoading ? "pointer-events-none" : "")}
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
  // const { toast } = useToast(); // Removed, no toasts on this page currently
  
  const [isAttendanceFeatureEnabled, setIsAttendanceFeatureEnabled] = useState(false);
  const [showDisabledAttendanceMessage, setShowDisabledAttendanceMessage] = useState(false);
  const [isLoadingMenu, setIsLoadingMenu] = useState(true); 


  useEffect(() => {
    if (typeof window !== 'undefined') {
      const status = sessionStorage.getItem('loginWebhookStatus');
      if (status === '200') { 
        setIsAttendanceFeatureEnabled(true);
        setShowDisabledAttendanceMessage(false);
      } else {
        setIsAttendanceFeatureEnabled(false);
        setShowDisabledAttendanceMessage(true);
      }
      setIsLoadingMenu(false); 
    }
  }, []);


  const primaryMenuItems: MenuItemProps[] = [
    { title: 'Attendance', icon: Users, onClick: () => router.push('/attendance'), isDisabled: !isAttendanceFeatureEnabled },
    { title: 'Vehicles', icon: Car, href: '#', isDisabled: false}, 
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
      {/* <Toaster /> Removed */}
      {/* AlertDialog for "Out of Schedule" removed */}

      <AppHeader className="my-2 sm:my-4" /> 
      
      {showDisabledAttendanceMessage && (
        <Alert variant="default" className="mb-4 max-w-xl mx-auto border-primary/50 bg-primary/5">
          <AlertTriangleIcon className="h-5 w-5 text-primary" />
          <AlertTitleUi className="text-primary">Access Information</AlertTitleUi>
          <AlertDescUi className="text-foreground/80">
            Access is currently disabled. Registration is only available from 7:00 a.m. to 7:15 a.m.
          </AlertDescUi>
        </Alert>
      )}


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
