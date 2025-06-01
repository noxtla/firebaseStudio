
"use client";

import { useState, type ChangeEvent, useEffect, useCallback } from 'react'; // Import useCallback
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


const MAX_ATTENDANCE_STEPS: FormStep = 3; // 0:SSN, 1:BirthDay, 2:Photo, 3:Done

const attendanceStepLabels = ["SSN", "Birth Day", "Photo", "Done"];
const ATTENDANCE_STEP_CONFIG = [
  { title: "Enter Last 4 of SSN", icon: Info },       // Step 0 (SSN)
  { title: "Day of Birth", icon: CalendarDays },    // Step 1 (Birth Day)
  { title: "Take a Photo", icon: CameraIconLucide },  // Step 2 (Photo)
  { title: "Send Your Information", icon: CheckCircle2 }, // Step 3 (Done) - This title is for CompletionScreen
];

interface AttendanceFormProps {
    initialUserData: UserData;
}

export default function AttendanceForm({ initialUserData }: AttendanceFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>(0); // Start at SSN step
  const [formData, setFormData] = useState<Pick<FormData, 'ssnLast4' | 'birthDay'>>({
    ssnLast4: '',
    birthDay: '',
  });

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureTimestamp, setCaptureTimestamp] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);
  const [userInitials, setUserInitials] = useState<string | null>(null);
  const [isBirthDayInputValid, setIsBirthDayInputValid] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (initialUserData && initialUserData.Name) {
      const nameParts = initialUserData.Name.split(' ');
      const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
      setUserInitials(initials);
    }
  }, [initialUserData]);


  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "birthDay") {
        const numericValue = value.replace(/\D/g, ''); // Keep cleaning here as parent's responsibility
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
  }, []); // setIsBirthDayInputValid is stable

  const getCanProceed = (): boolean => {
    switch (currentStep) {
      case 0: // SSN
        return formData.ssnLast4.length === 4 && /^\d{4}$/.test(formData.ssnLast4);
      case 1: // Birth Day
        return isBirthDayInputValid;
      case 2: // Photo
        return !!capturedImage && !!capturedLocation;
      default:
        return true;
    }
  };

  const canProceed = getCanProceed();

  const nextStep = async () => {
    if (canProceed) {
      if (currentStep === 0) { // SSN to BirthDay
        toast({ variant: "success", title: "Success", description: "SSN format accepted." });
        setCurrentStep(1);
      } else if (currentStep === 1) { // BirthDay to Photo
        toast({ variant: "success", title: "Success", description: "Birth day verified." });
        setCurrentStep(2);
      } else if (currentStep < MAX_ATTENDANCE_STEPS) { // Photo to Completion
        setCurrentStep((prev) => (prev + 1) as FormStep);
      }
    } else {
        console.log("Cannot proceed: current step data is not valid.");
    }
  };


  const prevStep = () => {
    if (currentStep === 0) {
      router.push('/main-menu');
    } else if (currentStep > 0) {
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
    }
  };

  const handleRestartFromCompletion = () => {
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('currentTruckNumber'); 
    }
    router.push('/main-menu');
  };
  
  const ActiveIcon = currentStep < MAX_ATTENDANCE_STEPS ? ATTENDANCE_STEP_CONFIG[currentStep]?.icon : null;
  const activeTitle = currentStep < MAX_ATTENDANCE_STEPS ? ATTENDANCE_STEP_CONFIG[currentStep]?.title : "";
  
  const showAppHeader = true; 
  const showStepper = currentStep <= MAX_ATTENDANCE_STEPS; 
  const showStepTitle = currentStep < MAX_ATTENDANCE_STEPS; 
  const showNavButtons = currentStep < MAX_ATTENDANCE_STEPS;

  const formatInitialsForDisplay = (initials: string): string => {
    return initials
      .split('')
      .map(char => `${char}****`)
      .join(' ');
  };

  let formattedUserInitialsForStep: string | null = null;
  if (userInitials && currentStep === 2) { 
    formattedUserInitialsForStep = formatInitialsForDisplay(userInitials);
  }

  const renderActiveStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <SsnStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 1:
        return (
          <BirthDayStep
            formData={formData}
            onInputChange={handleInputChange}
            userData={initialUserData} 
            onValidationChange={handleBirthDayValidationChange}
          />
        );
      case 2: 
        return (
          <PhotoStep
            onPhotoCaptured={handlePhotoCaptured}
            capturedImage={capturedImage}
            formattedUserInitials={formattedUserInitialsForStep}
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
                // The button is now always enabled for step 0 to go back to main menu
                // disabled={currentStep === 0} // Previous condition removed
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button onClick={nextStep} disabled={!canProceed}>
                 Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
