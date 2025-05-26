
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  Users,
  Truck,
  ClipboardList,
  ShieldCheck,
  MessageSquare,
  AlertTriangle as AlertTriangleIcon,
  type LucideIcon,
  Loader2,
  AlertTriangle, 
  MapPin, 
  ShieldAlert as ShieldAlertIcon, 
} from 'lucide-react';
import AppHeader from '@/components/app-header';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert as ShadAlert, AlertDescription as AlertDescUi, AlertTitle as AlertTitleUi } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from '@/components/ui/toaster';

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
  const { toast } = useToast();
  const [isAttendanceFeatureEnabled, setIsAttendanceFeatureEnabled] = useState(true); 
  // const [isAttendanceLoading, setIsAttendanceLoading] = useState(false); // Removed as per previous instruction to simplify Attendance button

  // Removed vehicles webhook states
  // const [isVehiclesLoading, setIsVehiclesLoading] = useState(false);
  // const [vehiclesWebhookResponse, setVehiclesWebhookResponse] = useState<string | null>(null);


  const handleAttendanceClick = async () => {
    // setIsAttendanceLoading(true); // Removed as per previous instruction
    // Webhook call was removed from here in a previous step.
    // If the button is not disabled, it will navigate.
    router.push('/attendance');
    // setIsAttendanceLoading(false); // Removed
  };

  // Removed handleVehiclesClick as it's no longer calling a webhook
  // The "Vehicles" MenuItem will now use href for direct navigation

  const primaryMenuItems: MenuItemProps[] = [
    { title: 'Attendance', icon: Users, onClick: handleAttendanceClick, isDisabled: !isAttendanceFeatureEnabled }, // isAttendanceLoading removed
    { title: 'Vehicles', icon: Truck, href: '/vehicles/enter-truck-number', isDisabled: false },
    { title: 'Job Briefing', icon: ClipboardList, href: '#', isDisabled: false },
    { title: 'Safety', icon: ShieldCheck, href: '#', isDisabled: false },
  ];

  const secondaryMenuItems: MenuItemProps[] = [
    { title: 'Support', icon: MessageSquare, href: '#', isPrimary: false, isDisabled: false },
    { title: 'Emergency Support', icon: AlertTriangleIcon, href: '#', isPrimary: false, isDisabled: false },
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loginStatus = sessionStorage.getItem('loginWebhookStatus');
      if (loginStatus !== '200') { // Assuming 200 is the success status that enables attendance
        setIsAttendanceFeatureEnabled(false);
      } else {
        setIsAttendanceFeatureEnabled(true);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background p-2 sm:p-4">
      <Toaster />
      <AppHeader className="my-2 sm:my-4" />

      {!isAttendanceFeatureEnabled && (
         <ShadAlert variant="default" className="mb-4 max-w-xl mx-auto border-primary/50 bg-primary/5 text-primary">
          <AlertTriangle className="h-4 w-4 !text-primary" />
          <AlertTitleUi>Attendance Access Notice</AlertTitleUi>
          <AlertDescUi>Attendance features might be limited based on your login status. The registration is typically available from 7:00 a.m. to 7:15 a.m.</AlertDescUi>
        </ShadAlert>
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

      {/* Removed vehiclesWebhookResponse display section */}

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
    
