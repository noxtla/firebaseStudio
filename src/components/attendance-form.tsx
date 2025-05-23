
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { FormData, FormStep, UserData, CapturedLocation } from '@/types';
import { useToast } from "@/hooks/use-toast";
// Toaster is now in attendance/page.tsx

import AppHeader from './app-header';
import ProgressStepper from './progress-stepper';
import SsnStep from './steps/ssn-step';
import BirthDayStep from './steps/birth-day-step';
import PhotoStep from './steps/photo-step';
import CompletionScreen from './steps/completion-screen';

import { Button } from '@/components/ui/button';
import { Info, CalendarDays, Camera as CameraIconLucide, CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const initialAttendanceFormData: Pick<FormData, 'ssnLast4' | 'birthDay'> = {
  ssnLast4: '',
  birthDay: '',
};

const MAX_ATTENDANCE_STEPS: FormStep = 3; // 0:SSN, 1:BirthDay, 2:Photo, 3:Done

const attendanceStepLabels = ["SSN", "Birth Day", "Photo", "Done"];
const ATTENDANCE_STEP_CONFIG = [
  { title: "Enter Last 4 of SSN", icon: Info },       // Step 0 (SSN)
  { title: "Day of Birth", icon: CalendarDays },    // Step 1 (Birth Day)
  { title: "Take a Photo", icon: CameraIconLucide },  // Step 2 (Photo)
  { title: "Send Your Information", icon: CheckCircle2 }, // Step 3 (Done)
];

interface AttendanceFormProps {
  initialUserData: UserData;
}

const formatInitialsForDisplay = (initials: string): string => {
  return initials
    .split('')
    .map(char => `${char}****`)
    .join(' ');
};

export default function AttendanceForm({ initialUserData }: AttendanceFormProps) {
  const [currentStep, setCurrentStep] = useState<FormStep>(0); // 0:SSN, 1:BirthDay, 2:Photo, 3:Done
  const [formData, setFormData] = useState(initialAttendanceFormData);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureTimestamp, setCaptureTimestamp] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);
  
  // User initials derived from initialUserData
  const [userInitials, setUserInitials] = useState<string | null>(null);

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

  const getCanProceed = (): boolean => {
    switch (currentStep) {
      case 0: // SSN
        if (!initialUserData || formData.ssnLast4.length !== 4 || !/^\d{4}$/.test(formData.ssnLast4)) {
          return false;
        }
        return String(initialUserData.NSS) === formData.ssnLast4;
      case 1: // Birth Day
        if (!initialUserData || !initialUserData.dataBirth) return false;
        const day = parseInt(formData.birthDay, 10);
        if (isNaN(day) || day < 1 || day > 31 || formData.birthDay.length === 0 || formData.birthDay.length > 2) {
          return false;
        }
        try {
          const [year, month] = initialUserData.dataBirth.split('-').map(Number);
          const paddedDay = String(day).padStart(2, '0');
          const userEnteredFullDate = `${year}-${String(month).padStart(2, '0')}-${paddedDay}`;
          return userEnteredFullDate === initialUserData.dataBirth;
        } catch (e) {
          return false;
        }
      case 2: // Photo
        return !!capturedImage && !!capturedLocation; 
      default: // Completion Screen
        return true;
    }
  };

  const canProceed = getCanProceed();

  const nextStep = async () => {
    if (currentStep === 0 && canProceed) { // SSN
      toast({ variant: "success", title: "Success", description: "SSN verified." });
      setCurrentStep((prev) => (prev + 1) as FormStep);
    } else if (currentStep === 1 && canProceed) { // Birth Day
      toast({ variant: "success", title: "Success", description: "Birth day verified." });
      setCurrentStep((prev) => (prev + 1) as FormStep);
    } else if (currentStep < MAX_ATTENDANCE_STEPS && canProceed) { // Photo to Completion
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
    // Final submission is handled by CompletionScreen's own button
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
      if (currentStep === 1) { // Going back from BirthDay to SSN
        setFormData(prev => ({...prev, ssnLast4: ''})); // Or not, depending on desired UX
      }
      if (currentStep === 2) { // Going back from Photo to BirthDay
         setFormData(prev => ({...prev, birthDay: ''})); // Or not
      }
      if (currentStep === 3) { // Going back from Completion to Photo
        setCapturedImage(null);
        setCaptureTimestamp(null);
        setCapturedLocation(null);
      }
    }
  };

  const restartAttendanceForm = () => {
    // This should navigate back to main menu and clear session storage.
    sessionStorage.removeItem('userData');
    router.push('/main-menu');
  };

  let formattedUserInitialsForStep: string | null = null;
  if (userInitials && currentStep === 2) { // Only for photo step
    formattedUserInitialsForStep = formatInitialsForDisplay(userInitials);
  }


  const renderActiveStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <SsnStep
            formData={{ ssnLast4: formData.ssnLast4 }}
            onInputChange={handleInputChange}
            // Pass initials if needed based on previous logic
            // formattedUserInitials={userInitials ? formatInitialsForDisplay(userInitials) : null} 
          />
        );
      case 1:
        return (
          <BirthDayStep
            formData={{ birthDay: formData.birthDay }}
            onInputChange={handleInputChange}
            userData={initialUserData} // Use initialUserData for month/year display
             // Pass initials if needed
            // formattedUserInitials={userInitials ? formatInitialsForDisplay(userInitials) : null}
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
      case 3: // Done/Completion
        return (
          <CompletionScreen
            // Pass only relevant parts of formData if original FormData type is broader
            formData={{
              phoneNumber: initialUserData.phoneNumber, // from UserData
              ssnLast4: formData.ssnLast4,
              birthDay: formData.birthDay,
            }}
            capturedImage={capturedImage}
            captureTimestamp={captureTimestamp}
            capturedLocation={capturedLocation}
            userData={initialUserData} // Pass the full initialUserData
            onRestart={restartAttendanceForm} // This will take user to main menu
          />
        );
      default:
        return null;
    }
  };

  const ActiveIcon = ATTENDANCE_STEP_CONFIG[currentStep]?.icon;
  const activeTitle = ATTENDANCE_STEP_CONFIG[currentStep]?.title;
  
  const showAppHeader = true; // Always show header in this form
  const showStepper = currentStep <= MAX_ATTENDANCE_STEPS; // Show for SSN, BD, Photo, Done
  const showStepTitle = currentStep < MAX_ATTENDANCE_STEPS; // Show for SSN, BD, Photo
  const showNavButtons = currentStep < MAX_ATTENDANCE_STEPS; // Show for SSN, BD, Photo (Completion has its own)

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto">
        {showAppHeader && <AppHeader className="mt-8 mb-8" />}
        {/* Toaster is in parent page attendance/page.tsx */}
      </div>

      <div className="flex-grow overflow-y-auto p-4 pt-0">
        <div className="w-full max-w-md mx-auto">
          
          {showStepper && (
            <ProgressStepper
              currentStepIndex={currentStep} // 0 for SSN, 1 for BD, 2 for Photo
              steps={attendanceStepLabels}
              className="mb-6 w-full"
            />
          )}

          {showStepTitle && ActiveIcon && activeTitle && (
            <div className={cn(
              "mb-6 flex items-center justify-center text-lg sm:text-xl font-semibold space-x-2 text-foreground",
              "font-heading-style" 
            )}>
              <ActiveIcon className="h-6 w-6 text-primary" />
              <span>{activeTitle}</span>
            </div>
          )}

          <div className="animate-step-enter w-full" key={currentStep}>
            {renderActiveStepContent()}
          </div>

          {showNavButtons && (
            <div className="w-full mt-8 flex justify-between">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 0} // Cannot go previous from SSN
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
