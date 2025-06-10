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
  const [formData, setFormData] = useState<Pick<FormData, 'ssnLast4' | 'birthDay'>>({
    ssnLast4: initialUserData?.SSN?.slice(-4) || '',
    birthDay: initialUserData?.BirthDay || '',
  });
  const [isSsnValid, setIsSsnValid] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureTimestamp, setCaptureTimestamp] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);
  const [isBirthDayInputValid, setIsBirthDayInputValid] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false); // Added loading state

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    setIsSsnValid(formData.ssnLast4.length === 4 && /^\d{4}$/.test(formData.ssnLast4));
  }, [formData.ssnLast4]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "birthDay") {
        const numericValue = value.replace(/\D/g, '');
        setFormData((prev) => ({ ...prev, [name]: numericValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoCaptured = (
    imageDataUrl: string | null,
    timestamp?: string,
    location?: CapturedLocation | null
  ) => {
    setCapturedImage(imageDataUrl);
    setCaptureTimestamp(timestamp || null);
    setCapturedLocation(location || null);
  };

  const handleBirthDayValidationChange = useCallback((isValid: boolean) => {
    setIsBirthDayInputValid(isValid);
  }, []);

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
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

      if (currentStep === 0) {
        toast({ variant: "success", title: "Success", description: "SSN format accepted." });
        setCurrentStep(1);
      } else if (currentStep === 1) {
        toast({ variant: "success", title: "Success", description: "Birth day verified." });
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
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

    if (currentStep > 0) { // Only go back if not on the first step
      setCurrentStep((prev) => (prev - 1) as FormStep);
      if (currentStep === 1) { 
         setFormData(prev => ({...prev, birthDay: ''}));
         setIsBirthDayInputValid(false); 
      }
      if (currentStep === 2) { 
        setCapturedImage(null);
        setCaptureTimestamp(null);
        setCapturedLocation(null);
      }
    } else {
      // Do nothing or provide feedback if at the first step and "Previous" is clicked
      console.log("Cannot go back from the first step.");
    }
    setIsNavigating(false);
  };

  const handleRestartFromCompletion = () => {
    // This function is passed to CompletionScreen, loading state handled there
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
            onValidationChange={handleBirthDayValidationChange}
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
            formData={{
              phoneNumber: initialUserData.phoneNumber, 
              ssnLast4: formData.ssnLast4,
              birthDay: formData.birthDay,
            }}
            capturedImage={capturedImage}
            captureTimestamp={captureTimestamp}
            capturedLocation={capturedLocation}
            userData={initialUserData} 
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
