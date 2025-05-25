
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For navigation
import type { FormData, FormStep, UserData } from '@/types';
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
import InitialScreen from './steps/initial-screen';
import PhoneNumberStep from './steps/phone-number-step';
import SsnStep from './steps/ssn-step';
import BirthDayStep from './steps/birth-day-step';
import PhotoStep from './steps/photo-step';
import CompletionScreen from './steps/completion-screen';

import { Button } from '@/components/ui/button';
import { Phone, KeyRound, CalendarDays, Camera as CameraIconLucide, CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import ProgressStepper from './progress-stepper';

const initialFormData: FormData = {
  phoneNumber: '',
  ssnLast4: '',
  birthDay: '',
};

const MAX_STEPS: FormStep = 5; // 0: Initial, 1: Phone, 2: SSN, 3: BirthDay, 4: Photo, 5: Complete

const STEP_CONFIG = [
  { title: "Welcome", icon: null }, // Step 0 (Initial) - Not shown in stepper
  { title: "Enter Your Phone Number", icon: Phone }, // Step 1
  { title: "Enter Last 4 of SSN", icon: KeyRound }, // Step 2
  { title: "Day of Birth", icon: CalendarDays }, // Step 3
  { title: "Take a Photo", icon: CameraIconLucide }, // Step 4
  { title: "Review Your Information", icon: CheckCircle2 }, // Step 5 (Completion) - Stepper shows "Done"
];

const stepLabels = ["Phone", "SSN", "Birth Day", "Photo", "Done"];

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingPhoneNumber, setIsLoadingPhoneNumber] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<string | null>(null);
  const [isNotFoundAlertOpen, setIsNotFoundAlertOpen] = useState(false);

  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureTimestamp, setCaptureTimestamp] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<any>(null); // Changed from CapturedLocation | null
  const [userInitials, setUserInitials] = useState<string | null>(null);

  const { toast } = useToast();
  const router = useRouter();

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
    location?: any // Changed from CapturedLocation | null
  ) => {
    setCapturedImage(imageDataUrl);
    setCaptureTimestamp(timestamp || null);
    setCapturedLocation(location || null);
  };

  const getCanProceed = (): boolean => {
    if (isLoadingPhoneNumber) return false;
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
    setRawApiResponse(null); // Clear previous raw response
    if (typeof window !== 'undefined' && currentStep !== 1) { // Only clear user data if not on phone step, as it's being fetched
      // sessionStorage.removeItem('userData'); // Might be too aggressive, depends on desired flow.
      // sessionStorage.removeItem('loginWebhookStatus');
    }
    if (typeof window !== 'undefined') { // Always clear rawApiResponse from session on any next step
        sessionStorage.removeItem('rawApiResponse');
    }


    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1 && canProceed) {
      setIsLoadingPhoneNumber(true);
      setUserData(null); // Clear previous user data
      if (typeof window !== 'undefined') {
          sessionStorage.removeItem('userData');
          sessionStorage.removeItem('loginWebhookStatus');
      }


      const cleanedPhoneNumber = formData.phoneNumber.replace(/\D/g, '');
      const webhookUrl = 'http://3.145.55.33/webhook-test/phoneNumber'; // UPDATED URL

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: cleanedPhoneNumber }),
        });

        const responseStatus = response.status;
        const responseText = await response.text();
        setRawApiResponse(responseText);
        if (typeof window !== 'undefined') sessionStorage.setItem('rawApiResponse', responseText);


        if (response.ok && responseStatus !== 503) { // Handle 503 as a special success case for navigation, but not feature enable
          if (responseText) {
            try {
              const parsedData = JSON.parse(responseText);
              if (typeof parsedData === 'object' && parsedData !== null && parsedData.myField === "NO EXISTE") {
                toast({ variant: "destructive", title: "User Not Found", description: "User not found. Please check the phone number and try again." });
                setIsLoadingPhoneNumber(false);
                return;
              } else if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].Name) {
                const fetchedUserData: UserData = { ...parsedData[0], phoneNumber: cleanedPhoneNumber };
                setUserData(fetchedUserData);
                const nameParts = fetchedUserData.Name.split(' ');
                const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
                setUserInitials(initials);

                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('userData', JSON.stringify(fetchedUserData));
                  sessionStorage.setItem('loginWebhookStatus', responseStatus.toString());
                }
                toast({ variant: "success", title: "Success", description: "Phone number verified." });
                setCurrentStep(2); // Proceed to SSN step
              } else {
                toast({ variant: "destructive", title: "Error", description: "User data not found or invalid data received." });
              }
            } catch (jsonError) {
              console.error("JSON Parse Error:", jsonError, "Raw Response:", responseText);
              toast({ variant: "destructive", title: "Error", description: "Received an invalid response from the server." });
            }
          } else { // response.ok but empty responseText
             toast({ variant: "destructive", title: "Error", description: "User not found or empty response from server." });
          }
        } else if (responseStatus === 503) { // Explicitly handle 503 for navigation
             if (typeof window !== 'undefined') {
                sessionStorage.removeItem('userData'); // Clear any potentially stale user data
                sessionStorage.setItem('loginWebhookStatus', responseStatus.toString());
             }
             toast({
                variant: "default",
                title: "Service Information",
                description: "The service is temporarily unavailable for full features. Proceeding with limited access."
            });
            // Instead of navigating to main-menu, we proceed to the next step in the form
            setCurrentStep(2); // Proceed to SSN step, but features might be limited based on status
        } else if (responseStatus === 404) {
          setIsNotFoundAlertOpen(true);
        } else { // Handle other non-ok responses
          toast({ variant: "destructive", title: "Error", description: `Failed to verify phone number. Status: ${responseStatus}. ${responseText ? `Details: ${responseText}` : ''}` });
        }
      } catch (error: any) {
        let errorMessage = "An unknown network error occurred while verifying the phone number.";
        if (error instanceof Error) {
          errorMessage = `Could not connect: ${error.message}. Please check your internet connection and try again.`;
        }
        console.error("Phone Verification Fetch Error:", error);
        setRawApiResponse(errorMessage);
        if (typeof window !== 'undefined') sessionStorage.setItem('rawApiResponse', errorMessage);
        toast({
          variant: "destructive",
          title: "Network Error",
          description: errorMessage
        });
      } finally {
        setIsLoadingPhoneNumber(false);
      }
      return; // Prevent falling through
    }

    // Logic for SSN and BirthDay success toasts
    if (currentStep === 2 && canProceed) {
      toast({ variant: "success", title: "Success", description: "SSN verified." });
    } else if (currentStep === 3 && canProceed) {
      toast({ variant: "success", title: "Success", description: "Birth day verified." });
    }


    if (currentStep < MAX_STEPS && canProceed) {
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      // Clear specific form data when going back
      if (currentStep === 2) { // Going back from SSN to Phone
        setFormData(prev => ({ ...prev, ssnLast4: '' }));
        setUserData(null); // Clear user data as phone needs re-verification essentially
        setUserInitials(null);
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('userData');
            sessionStorage.removeItem('loginWebhookStatus');
        }
      } else if (currentStep === 3) { // Going back from BirthDay to SSN
         setFormData(prev => ({...prev, birthDay: ''}));
      } else if (currentStep === 4) { // Going back from Photo to BirthDay
        setCapturedImage(null);
        setCaptureTimestamp(null);
        setCapturedLocation(null);
      }
      setCurrentStep((prev) => (prev - 1) as FormStep);
      setRawApiResponse(null); // Clear raw API response when going back
      if (typeof window !== 'undefined') sessionStorage.removeItem('rawApiResponse');
    }
  };

  const restartForm = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    setUserData(null);
    setIsLoadingPhoneNumber(false);
    setRawApiResponse(null);
    setCapturedImage(null);
    setCaptureTimestamp(null);
    setCapturedLocation(null);
    setUserInitials(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('loginWebhookStatus');
      sessionStorage.removeItem('rawApiResponse');
    }
  };

  const ActiveIcon = currentStep > 0 && currentStep <= MAX_STEPS ? STEP_CONFIG[currentStep]?.icon : null;
  const activeTitle = currentStep > 0 && currentStep <= MAX_STEPS ? STEP_CONFIG[currentStep]?.title : "";

  const showAppHeader = currentStep !== 0;
  const showStepper = currentStep > 0 && currentStep <= MAX_STEPS;
  const showStepTitle = currentStep > 0 && currentStep < MAX_STEPS; // Only show for steps 1-4
  const showNavButtons = currentStep > 0 && currentStep < MAX_STEPS;

  const formatInitialsForDisplay = (initials: string): string => {
    return initials
      .split('')
      .map(char => `${char}****`)
      .join(' ');
  };

  let formattedUserInitialsForStep: string | null = null;
  if (userInitials && (currentStep === 2 || currentStep === 3 || currentStep === 4)) {
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
            formattedUserInitials={formattedUserInitialsForStep}
          />
        );
      case 3:
        return (
          <BirthDayStep
            formData={formData}
            onInputChange={handleInputChange}
            userData={userData}
            formattedUserInitials={formattedUserInitialsForStep}
          />
        );
      case 4:
        return (
          <PhotoStep
            onPhotoCaptured={handlePhotoCaptured}
            capturedImage={capturedImage}
            formattedUserInitials={formattedUserInitialsForStep}
          />
        );
      case 5:
        return (
          <CompletionScreen
            formData={formData}
            capturedImage={capturedImage}
            captureTimestamp={captureTimestamp}
            capturedLocation={capturedLocation}
            userData={userData}
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

      <div className={cn("w-full max-w-md mx-auto", { "pt-0": currentStep === 0, "pt-6 sm:pt-8 md:pt-12": currentStep !== 0 })}>
        {showAppHeader && <AppHeader className="my-8" />}
      </div>

      <div className={cn("w-full max-w-md mx-auto", { "px-4": currentStep !== 0 })}>
        {showStepper && (
            <ProgressStepper
              currentStepIndex={currentStep -1} // Adjust index because step 0 is initial screen
              steps={stepLabels}
              className="mb-6 w-full"
            />
        )}
        {showStepTitle && ActiveIcon && activeTitle && (
          <div className={cn(
            "mb-6 flex items-center justify-center font-semibold space-x-3 text-foreground font-heading-style",
            currentStep === 1 ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl" // Larger for phone step
          )}>
            <ActiveIcon className={cn(currentStep === 1 ? "h-7 w-7 sm:h-8 sm:w-8" : "h-6 w-6 sm:h-7 sm:w-7", "text-primary")} />
            <span>{activeTitle}</span>
          </div>
        )}
      </div>

      <div className={cn("flex-grow flex flex-col items-center justify-start p-4 pt-0", { "px-0": currentStep === 0 })}>
        <div className="w-full max-w-md mx-auto">
          <div className="animate-step-enter w-full" key={currentStep}>
            {renderActiveStepContent()}
          </div>

          {showNavButtons && (
            <div className="w-full mt-8 flex justify-between">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={isLoadingPhoneNumber || currentStep === 0 || currentStep === 1} // Disable previous on phone step
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button onClick={nextStep} disabled={!canProceed || isLoadingPhoneNumber}>
                {isLoadingPhoneNumber && currentStep === 1 ? (
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

    