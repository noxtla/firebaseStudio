"use client";

import { useState, type FC, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Users,
  Truck,
  ClipboardList,
  BookHeart,
  type LucideIcon,
  Loader2,
} from 'lucide-react';
import AppHeader from '@/components/app-header';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import type { UserData } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { WEBHOOK_URL } from '@/config/appConfig';

interface MenuItemProps {
  title: string;
  icon: LucideIcon;
  href?: string;
  isPrimary?: boolean;
  onClick?: () => Promise<void> | void;
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
  const [isCheckingAttendance, setIsCheckingAttendance] = useState(false);

  useEffect(() => {
    const userData = sessionStorage.getItem('userData');
    if (!userData) {
      router.push('/');
    }
  }, [router]);

  const handleAttendanceClick = async () => {
    setIsCheckingAttendance(true);
    console.log("--- INICIO DE VALIDACIÓN DE ASISTENCIA ---");

    try {
      const storedUserData = sessionStorage.getItem('userData');
      if (!storedUserData) {
        console.error("[FALLO] No se encontraron datos de usuario en sessionStorage.");
        toast({
          title: "Error",
          description: "User session not found. Please log in again.",
          variant: "destructive",
        });
        router.push('/');
        return;
      }
      
      const existingUserData: UserData = JSON.parse(storedUserData);
      const cleanPhoneNumber = existingUserData.phoneNumber.replace(/\D/g, '');
      
      console.log(`[PASO 1] Datos enviados al webhook:`, {
        phoneNumber: cleanPhoneNumber,
        action: 'attendance' 
      });

      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanPhoneNumber,
          action: 'attendance' 
        }),
      });
      
      console.log(`[PASO 2] Respuesta recibida del servidor. Status: ${response.status}, OK: ${response.ok}`);
      
      const responseData = await response.json();

      // AQUÍ: Este console.log mostrará la respuesta completa del webhook para depuración.
      console.log("[DEBUG] Respuesta JSON completa del Webhook:", responseData);

      if (response.ok && responseData && responseData.length > 0) {
        console.log("[CHECKPOINT A] La respuesta fue exitosa (status 200 y con datos).");
        const userInfo = responseData[0];

        console.log(`[CHECKPOINT B] Evaluando 'is_on_time_window'. Valor recibido:`, userInfo.is_on_time_window);
        
        if (userInfo.is_on_time_window) {
          console.log("[ÉXITO] 'is_on_time_window' es verdadero. Preparando para navegar a /attendance.");
          
          const reformatDate = (dateStr: string) => {
            if (!/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return dateStr;
            const [day, month, year] = dateStr.split('-');
            return `${year}-${month}-${day}`;
          };

          const completeUserData: UserData = {
            ...existingUserData,
            Name: userInfo.full_name || existingUserData.Name,
            SSN: userInfo.ssn,
            birth_date: reformatDate(userInfo.birth_date),
          };
          
          sessionStorage.setItem('userData', JSON.stringify(completeUserData));
          router.push('/attendance');

        } else {
          console.error("[FALLO] 'is_on_time_window' es falso o nulo. No se navegará.");
          toast({
            title: "Attendance Not Available",
            description: "You are outside of the allowed hours to record attendance.",
            variant: "destructive",
          });
        }
      } else {
        console.error(`[FALLO] La respuesta no fue exitosa. response.ok: ${response.ok}, responseData:`, responseData);
        const errorMessage = responseData.message || "Failed to check attendance status. Response was not OK or data was empty.";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }

    } catch (error) {
      console.error("[ERROR CATASTRÓFICO] Ocurrió un error en el bloque try/catch. Puede ser un problema de red, CORS, o JSON inválido.", error);
      toast({
        title: "Network Error",
        description: "Could not connect to the server. Please check your connection and try again.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingAttendance(false);
      console.log("--- FIN DE VALIDACIÓN DE ASISTENCIA ---");
    }
  };

  const primaryMenuItems: MenuItemProps[] = [
    { 
      title: 'Attendance', 
      icon: Users, 
      onClick: handleAttendanceClick,
      isLoading: isCheckingAttendance,
      isDisabled: isCheckingAttendance,
    },
    { title: 'Vehicles', icon: Truck, href: '/vehicles/enter-truck-number', isDisabled: false },
    { title: 'Job Briefing', icon: ClipboardList, href: '/job-briefing', isDisabled: false },
    { title: 'Safety', icon: BookHeart, href: '/safety/modules', isDisabled: false },
  ];

  const secondaryMenuItems: MenuItemProps[] = [];

  return (
    <div className="flex flex-col min-h-screen bg-background p-2 sm:p-4">
      <Toaster />
      <AppHeader className="my-2 sm:my-4" />

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