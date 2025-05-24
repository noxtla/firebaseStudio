
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { FormData, FormStep, UserData, CapturedLocation } from '@/types';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import AppHeader from './app-header';
import ProgressStepper from './progress-stepper';
import InitialScreen from './steps/initial-screen';
import PhoneNumberStep from './steps/phone-number-step';
import SsnStep from './steps/ssn-step';
import BirthDayStep from './steps/birth-day-step';
import PhotoStep from './steps/photo-step';
import CompletionScreen from './steps/completion-screen';

import { Button } from '@/components/ui/button';
import { Phone, Info, CalendarDays, Camera as CameraIconLucide, CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";

const initialFormData: FormData = {
  phoneNumber: '',
  ssnLast4: '',
  birthDay: '',
};

const MAX_STEPS: FormStep = 5; // 0:Initial, 1:Phone, 2:SSN, 3:BirthDay, 4:Photo, 5:Done

const stepLabels = ["Initial", "Phone", "SSN", "Birth Day", "Photo", "Done"];
const STEP_CONFIG = [
  { title: "Welcome", icon: null }, // Step 0 (Initial) - No icon/title needed here as InitialScreen has its own
  { title: "Enter Your Phone Number", icon: Phone }, // Step 1 (Phone)
  { title: "Enter Last 4 of SSN", icon: Info },       // Step 2 (SSN)
  { title: "Day of Birth", icon: CalendarDays },    // Step 3 (Birth Day)
  { title: "Take a Photo", icon: CameraIconLucide },  // Step 4 (Photo)
  { title: "Send Your Information", icon: CheckCircle2 }, // Step 5 (Done)
];

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingPhoneNumber, setIsLoadingPhoneNumber] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null); // Not actively used for display, but good for debugging
  const [rawApiResponse, setRawApiResponse] = useState<string | null>(null);
  const [isNotFoundAlertOpen, setIsNotFoundAlertOpen] = useState(false);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureTimestamp, setCaptureTimestamp] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);
  const [userInitials, setUserInitials] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter(); // Keep for potential future use, though not used for navigation in this flow

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const cleaned = ('' + value).replace(/\D/g, '');
      if (cleaned.length > 10) return;
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        let formatted = '';
        if (match[1]) formatted += `(${match[1]}`;
        if (match[2]) formatted += `) ${match[2]}`;
        if (match[3]) formatted += `-${match[3]}`;
        setFormData((prev) => ({ ...prev, [name]: formatted.trim() }));
        return;
      }
    } else if (name === "birthDay") {
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
    if (isLoadingPhoneNumber && currentStep === 1) return false;

    switch (currentStep) {
      case 0: // Initial Screen
        return true;
      case 1: // Phone Number
        return formData.phoneNumber.replace(/\D/g, '').length === 10;
      case 2: // SSN
        if (!userData || formData.ssnLast4.length !== 4 || !/^\d{4}$/.test(formData.ssnLast4)) {
          return false;
        }
        return String(userData.NSS) === formData.ssnLast4;
      case 3: // Birth Day
        if (!userData || !userData.dataBirth) return false;
        const day = parseInt(formData.birthDay, 10);
        if (isNaN(day) || day < 1 || day > 31 || formData.birthDay.length === 0 || formData.birthDay.length > 2) {
          return false;
        }
        try {
          const [year, month] = userData.dataBirth.split('-').map(Number);
          const paddedDay = String(day).padStart(2, '0');
          const userEnteredFullDate = `${year}-${String(month).padStart(2, '0')}-${paddedDay}`;
          return userEnteredFullDate === userData.dataBirth;
        } catch (e) {
          return false;
        }
      case 4: // Photo
        return !!capturedImage && !!capturedLocation;
      default: // Completion Screen or beyond
        return true;
    }
  };

  const canProceed = getCanProceed();

  const nextStep = async () => {
    setApiError(null);
    setRawApiResponse(null);

    if (currentStep === 0) { // Initial to Phone
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1 && canProceed) { // Phone to SSN
      setIsLoadingPhoneNumber(true);
      setUserData(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userData'); // Clear any old session data
      }
      
      const cleanedPhoneNumber = formData.phoneNumber.replace(/\D/g, '');
      const webhookUrl = 'https://n8n.srv809556.hstgr.cloud/webhook/login';
      
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: cleanedPhoneNumber }),
        });

        const responseText = await response.text();
        setRawApiResponse(responseText); 
        
        if (response.ok) {
          if (responseText) {
            try {
              const parsedData = JSON.parse(responseText);
              if (typeof parsedData === 'object' && parsedData !== null && parsedData.myField === "NO EXISTE") {
                toast({ variant: "destructive", title: "Error", description: "User not found. Please check the phone number and try again." });
                setUserData(null);
              } else if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].Name) {
                const fetchedUserData: UserData = parsedData[0];
                setUserData(fetchedUserData);
                if (fetchedUserData.Name) {
                  const nameParts = fetchedUserData.Name.split(' ');
                  const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
                  setUserInitials(initials);
                }
                toast({ variant: "success", title: "Success", description: "Phone number verified." });
                setCurrentStep(2); // Proceed to SSN step
              } else {
                console.error('Unexpected JSON structure:', parsedData);
                toast({ variant: "destructive", title: "Error", description: "Received an unexpected response. User data not found." });
                setUserData(null);
              }
            } catch (jsonError) {
              console.error('Error parsing JSON:', jsonError, 'Response text:', responseText);
              toast({ variant: "destructive", title: "Error", description: "Received an invalid response from the server." });
              setUserData(null);
            }
          } else { 
            toast({ variant: "destructive", title: "Error", description: "User not found or empty response from server." });
            setUserData(null);
          }
        } else { 
          if (response.status === 404) {
            setIsNotFoundAlertOpen(true);
          } else {
            const errorDetails = responseText || `Status: ${response.status}`;
            toast({ variant: "destructive", title: "Error", description: `Failed to verify phone number. ${errorDetails}.` });
          }
          setUserData(null);
        }
      } catch (error) {
        console.error('Error sending phone number to webhook:', error);
        let errorMessage = "An unknown network error occurred.";
        if (error instanceof Error) {
          errorMessage = `Could not connect: ${error.message}. Check internet or try again.`;
        }
        setRawApiResponse(`Fetch Error: ${errorMessage}`);
        toast({
          variant: "destructive",
          title: "Error Verifying Phone",
          description: errorMessage
        });
        setUserData(null);
      } finally {
        setIsLoadingPhoneNumber(false);
      }
      return;
    }

    if (currentStep === 2 && canProceed) { // SSN to BirthDay
      toast({ variant: "success", title: "Success", description: "SSN verified." });
      setCurrentStep(3);
    } else if (currentStep === 3 && canProceed) { // BirthDay to Photo
      toast({ variant: "success", title: "Success", description: "Birth day verified." });
      setCurrentStep(4);
    } else if (currentStep < MAX_STEPS && canProceed) { // Photo to Completion or other steps if any
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
      setApiError(null);
      setRawApiResponse(null);
      if (currentStep === 2) { // Going back from SSN to Phone
        setUserData(null);
        setUserInitials(null);
        setFormData(prev => ({...prev, ssnLast4: '', birthDay: ''})); // Clear subsequent form data
      }
      if (currentStep === 3) { // Going back from BirthDay to SSN
         setFormData(prev => ({...prev, birthDay: ''}));
      }
      if (currentStep === 4) { // Going back from Photo to BirthDay
        setCapturedImage(null);
        setCaptureTimestamp(null);
        setCapturedLocation(null);
      }
      // If going back from completion (step 5 to 4), photo data is already cleared by the above.
    }
  };

  const restartForm = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    setUserData(null);
    setIsLoadingPhoneNumber(false);
    setApiError(null);
    setRawApiResponse(null);
    setCapturedImage(null);
    setCaptureTimestamp(null);
    setCapturedLocation(null);
    setUserInitials(null);
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userData'); // Just in case
    }
  };
  
  const ActiveIcon = currentStep > 0 ? STEP_CONFIG[currentStep]?.icon : null;
  const activeTitle = currentStep > 0 ? STEP_CONFIG[currentStep]?.title : "";
  
  const showAppHeader = currentStep !== 0; 
  const showStepper = currentStep > 0 && currentStep <= MAX_STEPS; // Show for Phone, SSN, BD, Photo, Done
  const showStepTitle = currentStep > 0 && currentStep < MAX_STEPS; // Show for Phone, SSN, BD, Photo
  const showNavButtons = currentStep > 0 && currentStep < MAX_STEPS;

  const formatInitialsForDisplay = (initials: string): string => {
    return initials
      .split('')
      .map(char => `${char}****`)
      .join(' ');
  };

  let formattedUserInitialsForStep: string | null = null;
  if (userInitials && currentStep === 4) { // Only for photo step
    formattedUserInitialsForStep = formatInitialsForDisplay(userInitials);
  }

  const renderActiveStepContent = () => {
    switch (currentStep) {
      case 0:
        return <InitialScreen onNextStep={nextStep} />;
      case 1:
        return (
          <PhoneNumberStep
            formData={formData}
            onInputChange={handleInputChange}
            rawApiResponse={rawApiResponse}
          />
        );
      case 2:
        return (
          <SsnStep
            formData={formData}
            onInputChange={handleInputChange}
            // No initials on SSN step as per last user request
          />
        );
      case 3:
        return (
          <BirthDayStep
            formData={formData}
            onInputChange={handleInputChange}
            userData={userData}
            // No initials on BirthDay step
          />
        );
      case 4: // Photo
        return (
          <PhotoStep
            onPhotoCaptured={handlePhotoCaptured}
            capturedImage={capturedImage}
            formattedUserInitials={formattedUserInitialsForStep}
          />
        );
      case 5: // Completion
        return (
          <CompletionScreen
            formData={{
              phoneNumber: formData.phoneNumber, // Send current phone from form
              ssnLast4: formData.ssnLast4,
              birthDay: formData.birthDay,
            }}
            capturedImage={capturedImage}
            captureTimestamp={captureTimestamp}
            capturedLocation={capturedLocation}
            userData={userData} // Pass the full userData (contains Name, Puesto etc.)
            onRestart={restartForm}
          />
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
       <Toaster />
       <AlertDialog open={isNotFoundAlertOpen} onOpenChange={setIsNotFoundAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>User Not Found</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            The phone number entered was not found. Please check the number and try again.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsNotFoundAlertOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className={cn("w-full max-w-md mx-auto", {"pt-0": currentStep === 0, "pt-6 sm:pt-8 md:pt-12": currentStep !==0 })}>
        {showAppHeader && <AppHeader className="my-8" />}
      </div>
       
      <div className={cn("w-full max-w-md mx-auto", {"px-4": currentStep !==0 } )}>
        {showStepper && (
          <ProgressStepper
            currentStepIndex={currentStep -1} // Adjust index for 0-based stepper
            steps={stepLabels.slice(1)} // Exclude "Initial" from stepper labels
            className="mb-6 w-full"
          />
        )}
        {showStepTitle && ActiveIcon && activeTitle && (
              <div className={cn(
                "mb-6 flex items-center justify-center font-semibold space-x-3 text-foreground font-heading-style",
                // Responsive text size for step titles
                "text-lg sm:text-xl" 
              )}>
                <ActiveIcon className={cn("h-6 w-6 sm:h-7 sm:w-7", "text-primary")} />
                <span>{activeTitle}</span>
              </div>
        )}
      </div>

      <div className={cn("flex-grow flex flex-col items-center justify-start p-4 pt-0", {"px-0": currentStep === 0})}>
        <div className="w-full max-w-md mx-auto">
          <div className="animate-step-enter w-full" key={currentStep}>
            {renderActiveStepContent()}
          </div>

          {showNavButtons && (
            <div className="w-full mt-8 flex justify-between">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={(currentStep === 1 && isLoadingPhoneNumber) || currentStep === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button onClick={nextStep} disabled={!canProceed || (currentStep === 1 && isLoadingPhoneNumber)}>
                {currentStep === 1 && isLoadingPhoneNumber ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
