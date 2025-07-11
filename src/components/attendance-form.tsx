/**
 * Client-side functionality.
 */
"use client";

import { useState, type ChangeEvent, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { FormData, FormStep, UserData, CapturedLocation } from '@/types';
import { useToast } from "@/hooks/use-toast";
import { WEBHOOK_URL } from '@/config/appConfig';

import ProgressStepper from './progress-stepper';
import SsnStep from './steps/ssn-step';
import BirthDayStep from './steps/birth-day-step';
import PhotoStep from './steps/photo-step';
import CompletionScreen from './steps/completion-screen';

import { Button } from '@/components/ui/button';
import { Info, CalendarDays, Camera as CameraIconLucide, CheckCircle2, ArrowLeft, ArrowRight, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';
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

const MAX_ATTENDANCE_STEPS: FormStep = 3;

// 5 pasos para la UI
const stepperLabels = ["SSN", "Birth Day", "Photo", "Validation", "Registered"];
const ATTENDANCE_STEP_CONFIG = [
  { title: "Enter Last 4 of SSN", icon: Info },
  { title: "Day of Birth", icon: CalendarDays },
  { title: "Take Photo & Location", icon: CameraIconLucide },
  { title: "Biometric Validation", icon: ShieldCheck },
  { title: "Attendance Registered", icon: CheckCircle2 },
];

interface AttendanceFormProps {
    initialUserData: UserData;
}

export default function AttendanceForm({ initialUserData }: AttendanceFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
  const [isValidationComplete, setIsValidationComplete] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false); // Para el paso final de registro
  const [showFinalSuccessDialog, setShowFinalSuccessDialog] = useState(false); // Para el diálogo final
  const [formData, setFormData] = useState({
    ssnLast4: '',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
  });
  const [isSsnValid, setIsSsnValid] = useState(false);
  const [isBirthDayInputValid, setIsBirthDayInputValid] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureTimestamp, setCaptureTimestamp] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const isValid = formData.ssnLast4.length === 4 &&
      /^\d{4}$/.test(formData.ssnLast4) &&
      initialUserData?.SSN?.slice(-4) === formData.ssnLast4;
    setIsSsnValid(isValid);
  }, [formData.ssnLast4, initialUserData?.SSN]);

  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement> | { name: string; value: string }) => {
    const { name, value } = 'target' in e ? e.target : e;

    if (name === 'ssnLast4' || name === 'birthMonth' || name === 'birthDay' || name === 'birthYear') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, [setFormData]); 


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

  const handleBirthDayValidationChange = useCallback((isValid: boolean) => {
    setIsBirthDayInputValid(isValid);
  }, []);

  const handleMaxAttemptsReached = () => {
    toast({
      title: "Too Many Incorrect Attempts",
      description: "You have been returned to the main menu for security.",
      variant: "destructive",
    });
    router.push('/main-menu');
  };

  const getCanProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return isSsnValid;
      case 1:
        return isBirthDayInputValid;
      case 2:
        return !!capturedImage && !!capturedLocation;
      default:
        return true;
    }
  };

  const canProceed = getCanProceed();

  const nextStep = async () => {
    if (canProceed) {
      setIsNavigating(true);

      if (currentStep === 2) {
        try {
          console.log("Enviando webhook con action: 'location'...");
          const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'location',
              capturedLocation: capturedLocation,
              userData: initialUserData,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error("El webhook de ubicación falló:", errorText);
            toast({
              title: "Advertencia",
              description: "No se pudo pre-registrar la ubicación.",
              variant: "destructive"
            });
          } else {
            console.log("Webhook de ubicación enviado con éxito.");
          }
        } catch (error) {
          console.error("Error al enviar el webhook de ubicación:", error);
          toast({
            title: "Error de Red",
            description: "No se pudo conectar al servidor para registrar la ubicación.",
            variant: "destructive"
          });
        }
      }

      await new Promise(resolve => setTimeout(resolve, 300));

      if (currentStep < MAX_ATTENDANCE_STEPS) {
        setCurrentStep((prev) => (prev + 1) as FormStep);
      }
      setIsNavigating(false);
    } else {
        console.log("No se puede proceder: los datos del paso actual no son válidos.");
    }
  };

  const prevStep = async () => {
    setIsNavigating(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    if (currentStep > 0) {
      if (currentStep === 3 && isValidationComplete) {
         setIsValidationComplete(false);
      } else {
        setCurrentStep((prev) => (prev - 1) as FormStep);
        if (currentStep === 1) {
          setFormData(prev => ({...prev, ssnLast4: ''}));
          setIsSsnValid(false);
        }
        if (currentStep === 2) {
          setFormData(prev => ({...prev, birthMonth: '', birthDay: '', birthYear: ''}));
          setIsBirthDayInputValid(false);
        }
        if (currentStep === 3) {
          setCapturedImage(null);
          setCaptureTimestamp(null);
          setCapturedLocation(null);
        }
      }
    }
    setIsNavigating(false);
  };

  const handleFinalRegistration = async () => {
    setIsFinishing(true);
    try {
      console.log("Enviando webhook con action: 'finalAte'...");
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'finalAte',
          capturedImage,
          captureTimestamp,
          capturedLocation,
          userData: initialUserData,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send completion webhook');
      }
      setShowFinalSuccessDialog(true);
    } catch (error) {
      console.error('Error al enviar el webhook de finalización:', error);
      toast({
        title: "Error de Red",
        description: "No se pudo conectar con el servidor para finalizar. Su asistencia fue guardada, pero la notificación final falló.",
        variant: "destructive",
      });
      setShowFinalSuccessDialog(true);
    }
  };


  const handleRestartFromCompletion = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentTruckNumber');
    }
    router.push('/main-menu');
  };

  const progressStepIndex = isFinishing ? 5 : (currentStep < 3 ? currentStep : (isValidationComplete ? 4 : 3));
  const ActiveIcon = ATTENDANCE_STEP_CONFIG[progressStepIndex <= 4 ? progressStepIndex : 4]?.icon;
  const activeTitle = ATTENDANCE_STEP_CONFIG[progressStepIndex <= 4 ? progressStepIndex : 4]?.title;
  
  // AppHeader is now global, so flags to show it are removed.
  const showStepper = currentStep <= MAX_ATTENDANCE_STEPS;
  const showStepTitle = currentStep < MAX_ATTENDANCE_STEPS && !isValidationComplete;
  const showNavButtons = currentStep < MAX_ATTENDANCE_STEPS;

  const formatInitialsForDisplay = (fullName: string | undefined): string => {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map(part => part.charAt(0) + '****')
      .join(' ');
  };

  const renderActiveStepContent = () => {
    if (!initialUserData?.SSN) {
      return <p className="text-destructive text-center p-4">Error: El SSN del usuario no está disponible. No se puede continuar.</p>;
    }

    switch (currentStep) {
      case 0:
        return (
          <SsnStep
            formData={formData}
            onInputChange={handleInputChange}
            isSsnValid={isSsnValid}
          />
        );
      case 1:
        if (!initialUserData.birth_date) {
            return <p className="text-destructive text-center p-4">Error: La fecha de nacimiento del usuario no está disponible. No se puede continuar.</p>;
        }
        return (
          <BirthDayStep
            onInputChange={handleInputChange}
            onValidityChange={handleBirthDayValidationChange}
            expectedBirthDate={initialUserData.birth_date}
            onMaxAttemptsReached={handleMaxAttemptsReached}
          />
        );
      case 2:
        return (
          <PhotoStep
            onPhotoCaptured={handlePhotoCaptured}
            capturedImage={capturedImage}
            formattedUserInitials={formatInitialsForDisplay(initialUserData?.Name)}
          />
        );
      case 3:
        return (
          <CompletionScreen
            capturedImage={capturedImage}
            captureTimestamp={captureTimestamp}
            capturedLocation={capturedLocation}
            userData={initialUserData}
            onFinalSubmit={handleFinalRegistration}
            onValidationSuccess={() => setIsValidationComplete(true)}
            isValidationComplete={isValidationComplete}
            onRestart={handleRestartFromCompletion}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="flex flex-col min-h-screen bg-background">
         <Toaster />

         {/* The AppHeader has been removed from here. It is now in the global layout. */}

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
            <div className="animate-step-enter w-full" key={`${currentStep}-${isValidationComplete}`}>
              {renderActiveStepContent()}
            </div>

            {showNavButtons && (
              <div className="w-full mt-8 flex justify-between items-center">
                  <Button
                      variant="ghost"
                      onClick={prevStep}
                      disabled={isNavigating}
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
                        {isNavigating ? "Loading..." : (currentStep === 2 ? 'OK' : 'Next')}
                        {(isNavigating || currentStep === 2) ? null : <ArrowRight className="ml-2 h-4 w-4" />}
                    </Button>
                  </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AlertDialog open={showFinalSuccessDialog} onOpenChange={setShowFinalSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <CheckCircle2 className="h-12 w-12 text-success mb-2" />
            <AlertDialogTitle>Asistencia Completada con Éxito</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center">
            ¡Todo listo! Tu registro de asistencia está completo.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={handleRestartFromCompletion}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}