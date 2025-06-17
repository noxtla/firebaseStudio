"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceForm from '@/components/attendance-form';
import type { UserData } from '@/types';
import AppHeader from '@/components/app-header';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';

export default function AttendancePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log("--- CARGANDO PÁGINA DE ASISTENCIA ---");
    if (typeof window !== 'undefined') {
      const storedUserData = sessionStorage.getItem('userData');
      
      if (storedUserData) {
        console.log("[ÉXITO] Se encontró 'userData' en sessionStorage.");
        try {
          const parsedData = JSON.parse(storedUserData);
          console.log("[DATOS CARGADOS] El objeto de usuario es:", parsedData);
          setUserData(parsedData);
        } catch (error) {
          console.error("[FALLO] No se pudo parsear 'userData' desde sessionStorage", error);
          sessionStorage.removeItem('userData');
          router.replace('/');
        }
      } else {
        console.error("[FALLO] No se encontró 'userData' en sessionStorage. Redirigiendo al login.");
        router.replace('/');
      }
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Cargando datos de asistencia...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Toaster/>
        <AppHeader className="my-8" />
        <p className="text-destructive text-lg">No se encontraron datos de usuario. Por favor, inicie sesión de nuevo.</p>
        <Button onClick={() => router.push('/')} className="mt-4">Ir al Login</Button>
      </div>
    );
  }

  // Si llegamos aquí, userData es válido y se lo pasamos al formulario.
  console.log("[ÉXITO] Pasando userData al componente AttendanceForm.");
  return <AttendanceForm initialUserData={userData} />;
}