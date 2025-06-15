/**
 * Client-side functionality.
 */
"use client";

import { useState, type ChangeEvent, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { FormData, FormStep, UserData, CapturedLocation } from '@/types';
import { useToast } from "@/hooks/use-toast";

import AppHeader from './app-header';
import ProgressStepper from './progress-stepper';
import SsnStep from './steps/ssn-step';
import BirthDayStep from './steps/birth-day-step';
import PhotoStep from './steps/photo-step';
import CompletionScreen from './steps/completion-screen';

import { Button } from '@/components/ui/button';
import { Info, CalendarDays, Camera as CameraIconLucide, CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";

const MAX_ATTENDANCE_STEPS: FormStep = 3;

const attendanceStepLabels = ["SSN", "Birth Day", "Photo", "Done"];
const ATTENDANCE_STEP_CONFIG = [
  { title: "Enter Last 4 of SSN", icon: Info },
  { title: "Day of Birth", icon: CalendarDays },
  { title: "Take a Photo", icon: CameraIconLucide },
  { title: "Send Your Information", icon: CheckCircle2 },
];

interface AttendanceFormProps {
    initialUserData: UserData;
}

export default function AttendanceForm({ initialUserData }: AttendanceFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
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

  // Valida el SSN cuando cambia
  useEffect(() => {
    const isValid = formData.ssnLast4.length === 4 &&
      /^\d{4}$/.test(formData.ssnLast4) &&
      initialUserData?.SSN?.slice(-4) === formData.ssnLast4;
    setIsSsnValid(isValid);
  }, [formData.ssnLast4, initialUserData?.SSN]);

  // **MODIFICADO y MEJORADO:**
  // Este handler ahora acepta tanto un evento de input como un objeto {name, value}.
  // Está envuelto en useCallback para un rendimiento óptimo.
  const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement> | { name: string; value: string }) => {
    const { name, value } = 'target' in e ? e.target : e;

    if (name === 'ssnLast4' || name === 'birthMonth' || name === 'birthDay' || name === 'birthYear') {
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  }, [setFormData]); // El array de dependencias vacío es correcto aquí.


  const handlePhotoCaptured = (
    imageDataUrl: string | null,
    timestamp?: string,
    location?: CapturedLocation | null
  ) => {
    setCapturedImage(imageDataUrl);
    setCaptureTimestamp(timestamp || null);
    setCapturedLocation(location || null);
  };

  const handleBirthDayValidationChange = (isValid: boolean) => {
    setIsBirthDayInputValid(isValid);
  }

  const getCanProceed = (): boolean => {
    switch (currentStep) {
      case 0:
        return isSsnValid;
      case 1:
        return isBirthDayInputValid; // Ahora usa el estado local
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
      await new Promise(resolve => setTimeout(resolve, 300));

      if (currentStep === 0) {
        toast({ variant: "success", title: "Success", description: "SSN format accepted." });
        setCurrentStep(1);
      } else if (currentStep === 1) {
        toast({ variant: "success", title: "Success", description: "Birth day selected." });
        setCurrentStep(2);
      } else if (currentStep < MAX_ATTENDANCE_STEPS) {
        setCurrentStep((prev) => (prev + 1) as FormStep);
      }
      setIsNavigating(false);
    } else {
        console.log("Cannot proceed: current step data is not valid.");
    }
  };

  const prevStep = async () => {
    setIsNavigating(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
      // **LÓGICA DE LIMPIEZA MEJORADA**
      if (currentStep === 1) { // Volviendo a SSN
        setFormData(prev => ({...prev, ssnLast4: ''}));
        setIsSsnValid(false);
      }
      if (currentStep === 2) { // Volviendo a Fecha de Nacimiento
        // Limpiamos la fecha completa para evitar estados inconsistentes
        setFormData(prev => ({...prev, birthMonth: '', birthDay: '', birthYear: ''}));
        setIsBirthDayInputValid(false);
      }
      if (currentStep === 3) { // Volviendo a Foto
        setCapturedImage(null);
        setCaptureTimestamp(null);
        setCapturedLocation(null);
      }
    }
    setIsNavigating(false);
  };

  const handleRestartFromCompletion = () => {
    router.push('/main-menu');
  };

  const ActiveIcon = currentStep < MAX_ATTENDANCE_STEPS ? ATTENDANCE_STEP_CONFIG[currentStep]?.icon : null;
  const activeTitle = currentStep < MAX_ATTENDANCE_STEPS ? ATTENDANCE_STEP_CONFIG[currentStep]?.title : "";

  const showAppHeader = true;
  const showStepper = currentStep <= MAX_ATTENDANCE_STEPS;
  const showStepTitle = currentStep < MAX_ATTENDANCE_STEPS;
  const showNavButtons = currentStep < MAX_ATTENDANCE_STEPS;

  const formatInitialsForDisplay = (fullName: string | undefined): string => {
    if (!fullName) return '';
    return fullName
      .split(' ')
      .map(part => part.charAt(0) + '****')
      .join(' ');
  };

  const renderActiveStepContent = () => {
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
        return (
          <BirthDayStep
            formData={formData}
            onInputChange={handleInputChange}
            onValidityChange={handleBirthDayValidationChange}
            expectedBirthDate={initialUserData.birth_date}
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
        // 1. Construct the full birth date string from the form state.
        const fullBirthDate = `${formData.birthYear}-${formData.birthMonth}-${formData.birthDay}`;

        // 2. Create a new, complete user data object that satisfies the type.
        //    We use the spread operator (...) to copy existing properties from initialUserData
        //    and then add/overwrite the properties we've collected.
        const completeUserData = {
            ...initialUserData, // Copies Name, SSN, phoneNumber, Position, etc.
            birth_date: fullBirthDate, // Add the missing birth_date
        };

        return (
          <CompletionScreen
            formData={{
              phoneNumber: initialUserData.phoneNumber,
              ssnLast4: formData.ssnLast4,
              birthMonth: formData.birthMonth,
              birthDay: formData.birthDay,
              birthYear: formData.birthYear,
            }}
            capturedImage={capturedImage}
            captureTimestamp={captureTimestamp}
            capturedLocation={capturedLocation}
            // 3. Pass the new, complete object here.
            userData={completeUserData}
            onRestart={handleRestartFromCompletion}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <Toaster />

      <div className="w-full max-w-md mx-auto pt-6 sm:pt-8 md:pt-12">
        {showAppHeader && <AppHeader className="my-8" />}
      </div>

      <div className="w-full max-w-md mx-auto px-4">
        {showStepper && (
          <ProgressStepper
            currentStepIndex={currentStep}
            steps={attendanceStepLabels.slice(0, -1)}
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
            <div className="w-full mt-8 flex justify-between">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={isNavigating}
              >
                {isNavigating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowLeft className="mr-2 h-4 w-4" />}
                {isNavigating ? "Loading..." : "Previous"}
              </Button>
              <Button onClick={nextStep} disabled={!canProceed || isNavigating}>
                {isNavigating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isNavigating ? "Loading..." : "Next"}
                {isNavigating ? null : <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
