"use client";

import { useState, type ChangeEvent, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { FormStep, UserData, CapturedLocation } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { WEBHOOK_URL } from '@/config/appConfig';

import ProgressStepper from './progress-stepper';
import LocationValidationStep from './steps/location-validation-step';
import ScheduleValidationStep from './steps/schedule-validation-step';
import PhotoStep from './steps/photo-step';
// ELIMINADA: import CompletionScreen from './steps/completion-screen';

import { Button } from '@/components/ui/button';
import {
  Camera as CameraIconLucide, CheckCircle2, ArrowLeft, ArrowRight, Loader2, RefreshCw, ShieldCheck,
  MapPin, CalendarCheck2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import {
  AlertDialog, // Se mantiene por si se usa en otros componentes, pero no para el diálogo final aquí
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MAX_ATTENDANCE_STEPS: FormStep = 2; // CAMBIADO: Ahora el flujo termina en el paso de la foto (índice 2)

// Solo 3 pasos para la UI visible
const stepperLabels = ["Location", "Schedule", "Photo"]; // CAMBIADO
const ATTENDANCE_STEP_CONFIG = [ // CAMBIADO
  { title: "Validate Location", icon: MapPin },
  { title: "Check Schedule", icon: CalendarCheck2 },
  { title: "Take Photo & Location", icon: CameraIconLucide },
  // Eliminados Validation y Registered temporalmente
];

interface AttendanceFormProps {
    initialUserData: UserData;
}

export default function AttendanceForm({ initialUserData }: AttendanceFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
  // ELIMINADO: const [isValidationComplete, setIsValidationComplete] = useState(false);
  // ELIMINADO: const [isFinishing, setIsFinishing] = useState(false);
  // ELIMINADO: const [showFinalSuccessDialog, setShowFinalSuccessDialog] = useState(false);
  const [formData, setFormData] = useState({});

  const [isLocationValidated, setIsLocationValidated] = useState(false);
  const [isScheduleValidated, setIsScheduleValidated] = useState(false);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureTimestamp, setCaptureTimestamp] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = useCallback(() => {
    // Ya no se manejan inputs de SSN/BirthDay aquí.
  }, []);

  const handlePhotoCaptured = (
    imageDataUrl: string | null,
    timestamp?: string,
    location?: CapturedLocation | null
  ) => {
    setCapturedImage(imageDataUrl);
    setCaptureTimestamp(timestamp || null);
    setCapturedLocation(location || null);
  };

  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setCaptureTimestamp(null);
    setCapturedLocation(null);
  };

  const getCanProceed = (): boolean => {
    switch (currentStep) {
      case 0: // Paso de Ubicación
        return isLocationValidated;
      case 1: // Paso de Horario
        return isScheduleValidated;
      case 2: // Paso de la Foto (ahora es el último paso "funcional")
        return !!capturedImage && !!capturedLocation;
      default:
        return true; // No deberíamos llegar aquí si el flujo está bien definido hasta MAX_ATTENDANCE_STEPS
    }
  };

  const canProceed = getCanProceed();

  const nextStep = async () => {
    if (canProceed) {
      setIsNavigating(true);

      await new Promise(resolve => setTimeout(resolve, 300));

      if (currentStep < MAX_ATTENDANCE_STEPS) {
        setCurrentStep((prev) => (prev + 1) as FormStep);
      } else if (currentStep === MAX_ATTENDANCE_STEPS) {
        // Si estamos en el último paso permitido (la foto) y se presiona Next,
        // se redirige al menú principal después de mostrar un toast.
        toast({
          title: "Attendance Recorded (Temporary)",
          description: "Photo captured. Proceeding to main menu as final steps are temporarily disabled.",
          variant: "success",
        });

        // Opcional: Si quieres enviar la foto aquí al terminar el flujo temporalmente.
        // Aquí podrías añadir una llamada a tu webhook para enviar la foto y ubicación.
        // Por ejemplo:
        /*
        try {
            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'temporaryPhotoFinish', // Una nueva acción para este flujo temporal
                    capturedImage,
                    captureTimestamp,
                    capturedLocation,
                    userData: initialUserData,
                }),
            });
            if (!response.ok) {
                console.error("Fallo el webhook temporal de la foto final", await response.text());
                toast({ title: "Error Temporal", description: "La foto se tomó pero no se pudo enviar.", variant: "destructive" });
            }
        } catch (error) {
            console.error("Error en el webhook temporal de la foto final:", error);
            toast({ title: "Error de Red", description: "No se pudo contactar al servidor para el registro final.", variant: "destructive" });
        }
        */

        router.push('/main-menu');
      }
      setIsNavigating(false);
    } else {
        console.log("No se puede proceder: los datos del paso actual no son válidos.");
    }
  };

  const prevStep = async () => {
    setIsNavigating(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    if (currentStep > 0) { // Siempre permite retroceder si no es el primer paso
      const previousStepValue = currentStep - 1;
      setCurrentStep(previousStepValue as FormStep);

      // Limpiar datos del paso al que se regresa
      if (previousStepValue === 2) { // Regresando a la foto (currentStep === 2)
          setCapturedImage(null);
          setCaptureTimestamp(null);
          setCapturedLocation(null);
      } else if (previousStepValue === 1) { // Regresando al horario (currentStep === 1)
          setIsScheduleValidated(false);
      } else if (previousStepValue === 0) { // Regresando a la ubicación (currentStep === 0)
          setIsLocationValidated(false);
      }
    }
    setIsNavigating(false);
  };

  // ELIMINADAS: handleFinalRegistration y handleRestartFromCompletion

  // Ajustado el cálculo del progressStepIndex para los 3 pasos visibles (0-2)
  const progressStepIndex = currentStep; // Ya no hay estado isFinishing separado
  const ActiveIcon = ATTENDANCE_STEP_CONFIG[progressStepIndex]?.icon; // Directamente el icono del currentStep
  const activeTitle = ATTENDANCE_STEP_CONFIG[progressStepIndex]?.title; // Directamente el título del currentStep

  const showStepper = true; // Siempre mostrar el stepper
  const showStepTitle = true; // Siempre mostrar el título del paso
  const showNavButtons = true; // Siempre mostrar los botones de navegación

  const formatInitialsForDisplay = (fullName: string | undefined): string => {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map(part => part.charAt(0) + '****')
      .join(' ');
  };

  const renderActiveStepContent = () => {
    switch (currentStep) {
      case 0: // Paso: Validación de Ubicación
        return (
          <LocationValidationStep
            userData={initialUserData}
            onLocationValidated={(loc) => {
              setCapturedLocation(loc); // Guarda la ubicación capturada para el paso de la foto
              setIsLocationValidated(true);
            }}
            isActiveStep={currentStep === 0}
          />
        );
      case 1: // Paso: Validación de Horario
        return (
          <ScheduleValidationStep
            userData={initialUserData}
            onScheduleValidated={() => setIsScheduleValidated(true)}
            isActiveStep={currentStep === 1}
          />
        );
      case 2: // Paso: Toma de Foto
        return (
          <PhotoStep
            onPhotoCaptured={handlePhotoCaptured}
            capturedImage={capturedImage}
            formattedUserInitials={formatInitialsForDisplay(initialUserData?.Name)}
          />
        );
      // ELIMINADO: case 3 (CompletionScreen)
      default:
        // Si por alguna razón currentStep excede MAX_ATTENDANCE_STEPS
        // o hay un estado inesperado, redirigimos o mostramos un mensaje.
        useEffect(() => {
          if (currentStep > MAX_ATTENDANCE_STEPS) {
            router.push('/main-menu'); // O una página de error
          }
        }, [currentStep, router]);
        return <div className="text-center text-muted-foreground p-8">Error: Paso desconocido o fuera de secuencia. Redirigiendo...</div>;
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
         <Toaster />

        <div className="w-full max-w-md mx-auto px-4">
          {showStepper && (
            <ProgressStepper
              currentStepIndex={progressStepIndex}
              steps={stepperLabels}
              className="mb-6 w-full"
            />
          )}
          {showStepTitle && ActiveIcon && activeTitle && (
              <div className={cn(
                "mb-6 flex items-center justify-center font-semibold space-x-3 text-foreground font-heading-style",
                "text-lg sm:text-xl"
              )}>
                <ActiveIcon className={cn("h-6 w-6 sm:h-7 sm:w-7", "text-primary")} />
                <span>{activeTitle}</span>
              </div>
          )}
        </div>

        <div className="flex-grow flex flex-col items-center justify-start p-4 pt-0">
          <div className="w-full max-w-md mx-auto">
            <div className="animate-step-enter w-full" key={currentStep}>
              {renderActiveStepContent()}
            </div>

            {showNavButtons && (
              <div className="w-full mt-8 flex justify-between items-center">
                  <Button
                      variant="ghost"
                      onClick={prevStep}
                      disabled={isNavigating || currentStep === 0} // Deshabilitar el botón "Previous" en el primer paso (Location)
                      className={cn(currentStep === 2 && !capturedImage && "invisible")}
                  >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {currentStep === 2 && capturedImage && (
                        <Button
                            variant="outline"
                            onClick={handleRetakePhoto}
                            disabled={isNavigating}
                            aria-label="Retake photo"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Retake
                        </Button>
                    )}

                    <Button
                      onClick={nextStep}
                      disabled={!canProceed || isNavigating}
                      className={cn(currentStep === 2 && !capturedImage && "invisible")}
                    >
                        {isNavigating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        {isNavigating ? "Loading..." : (currentStep === MAX_ATTENDANCE_STEPS ? 'Submit' : 'Next')}
                        {(isNavigating || currentStep === MAX_ATTENDANCE_STEPS) ? null : <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ELIMINADO: AlertDialog para showFinalSuccessDialog */}
    </>
  );
}