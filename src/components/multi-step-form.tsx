
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import ProgressStepper from './progress-stepper';
import InitialScreen from './steps/initial-screen';
import PhoneNumberStep from './steps/phone-number-step';
import SsnStep from './steps/ssn-step';
import BirthDayStep from './steps/birth-day-step';
import PhotoStep from './steps/photo-step';
import CompletionScreen from './steps/completion-screen';

import { Button } from '@/components/ui/button';
import { Phone, Lock, CalendarDays, Camera as CameraIconLucide, CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";

const initialFormData: FormData = {
  phoneNumber: '',
  ssnLast4: '',
  birthDay: '',
};

const MAX_STEPS: FormStep = 5; // 0: Initial, 1: Phone, 2: SSN, 3: BirthDay, 4: Photo, 5: Complete

const STEP_CONFIG = [
  { title: "", icon: null }, // Initial Screen (Step 0)
  { title: "Enter Your Phone Number", icon: Phone }, // Step 1
  { title: "Enter Last 4 of SSN", icon: Lock }, // Step 2
  { title: "Day of Birth", icon: CalendarDays }, // Step 3
  { title: "Take a Photo", icon: CameraIconLucide }, // Step 4
  { title: "Done", icon: CheckCircle2 }, // Step 5
];

const stepLabels = ["Phone", "SSN", "Birth Day", "Photo", "Done"];

// Helper function to format initials
const formatInitialsForDisplay = (initials: string): string => {
  return initials
    .split('')
    .map(char => `${char}****`)
    .join(' ');
};

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingPhoneNumber, setIsLoadingPhoneNumber] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [rawApiResponse, setRawApiResponse] = useState<string | null>(null);
  const [isNotFoundAlertOpen, setIsNotFoundAlertOpen] = useState(false);


  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureTimestamp, setCaptureTimestamp] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<any | null>(null); // Using any for now
  const [userInitials, setUserInitials] = useState<string | null>(null);


  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const cleaned = ('' + value).replace(/\D/g, '');
      // Max 10 digits for phone number
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
    }
     else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handlePhotoCaptured = (
    imageDataUrl: string | null,
    timestamp?: string,
    location?: any // Using any for now
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
          console.error("Error validating birth day:", e);
          return false;
        }
      case 4: // Photo
        return !!capturedImage && !!capturedLocation;
      default:
        return true;
    }
  };

  const canProceed = getCanProceed();

  const nextStep = async () => {
    setApiError(null); // Clear previous API errors

    if (currentStep === 0) { // From InitialScreen to PhoneNumberStep
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1 && canProceed) { // Phone Number submission
      setIsLoadingPhoneNumber(true);
      setRawApiResponse(null);
      setUserData(null);
      const cleanedPhoneNumber = formData.phoneNumber.replace(/\D/g, '');
      const webhookUrl = 'https://n8n.srv809556.hstgr.cloud/webhook-test/login';
      
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: cleanedPhoneNumber, phoneNumberFlag: true }),
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
              } 
              else if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].Name) {
                const userDataInstance: UserData = parsedData[0];
                setUserData(userDataInstance);
                 // Extract and set initials
                if (userDataInstance.Name) {
                  const nameParts = userDataInstance.Name.split(' ');
                  const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
                  setUserInitials(initials);
                }
                sessionStorage.setItem('userData', JSON.stringify(userDataInstance)); // Save to session storage for attendance form
                router.push('/main-menu'); // Navigate to main menu on successful phone login
                // toast({ variant: "success", title: "Success", description: "Phone number verified. Redirecting..." });
                // setCurrentStep((prev) => (prev + 1) as FormStep); // Proceed to SSN step
              } 
              else {
                console.error('Unexpected JSON structure:', parsedData);
                toast({ variant: "destructive", title: "Error", description: "Received an unexpected response from the server." });
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
          const errorDetails = responseText || `Status: ${response.status}`;
          if (response.status === 404) {
            setIsNotFoundAlertOpen(true);
          } else {
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
      return; // Important: Return here to avoid falling through if phone verification fails
    }

    // Logic for other steps (SSN, Birth Day, Photo)
    if (currentStep === 2 && canProceed) { // SSN to BirthDay
      toast({ variant: "success", title: "Success", description: "SSN verified." });
    } else if (currentStep === 3 && canProceed) { // BirthDay to Photo
      toast({ variant: "success", title: "Success", description: "Birth day verified." });
    }
    // Note: Photo to Completion is handled by a direct step increment below
    // Final submission (from Completion to end) is handled by CompletionScreen's own button

    if (currentStep < MAX_STEPS && canProceed) {
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
      setApiError(null); // Clear API errors when going back

      if (currentStep === 2) { // Going back from SSN to Phone
        // setUserData(null); // Clear user data if going back from SSN
        // setUserInitials(null);
      }
      // Reset specific form data or states if necessary when going back
      if (currentStep === 3) { // Back from BirthDay to SSN
        // setFormData(prev => ({...prev, ssnLast4: ''}));
      }
      if (currentStep === 4) { // Back from Photo to BirthDay
        // setFormData(prev => ({...prev, birthDay: ''}));
      }
      if (currentStep === 5) { // Back from Completion to Photo
        setCapturedImage(null);
        setCaptureTimestamp(null);
        setCapturedLocation(null);
      }
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
    sessionStorage.removeItem('userData');
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
           // No initials for SSN step
          />
        );
      case 3:
        return (
          <BirthDayStep
            formData={formData}
            onInputChange={handleInputChange}
            userData={userData}
            // No initials for BirthDay step
          />
        );
      case 4:
        return (
          <PhotoStep
            onPhotoCaptured={handlePhotoCaptured}
            capturedImage={capturedImage}
            formattedUserInitials={formattedUserInitialsForStep} // Only pass for PhotoStep
          />
        );
      case 5:
        return (
          <CompletionScreen
            formData={formData}
            capturedImage={capturedImage}
            captureTimestamp={captureTimestamp}
            capturedLocation={capturedLocation} // Pass location data
            userData={userData} // Pass full user data for display
            onRestart={() => router.push('/main-menu')} // Redirect to main menu after completion
          />
        );
      default:
        return null;
    }
  };
  
  const ActiveIcon = STEP_CONFIG[currentStep]?.icon;
  let activeTitle = STEP_CONFIG[currentStep]?.title;
  
  const showAppHeader = currentStep > 0 && currentStep <= MAX_STEPS;
  const showStepper = currentStep > 0 && currentStep <= MAX_STEPS;
  const showStepTitle = currentStep > 0 && currentStep < MAX_STEPS; // Not for Initial or Completion
  const showNavButtons = currentStep > 0 && currentStep < MAX_STEPS; // Not for Initial or Completion

  // Hide progress stepper for step 1 (phone number)
  const isPhoneStep = currentStep === 1;
  
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

      <div className={cn("w-full max-w-md mx-auto", { "pt-8 md:pt-12": !isPhoneStep, "pt-0": isPhoneStep })}>
        {showAppHeader && <AppHeader className="my-8" />}
      </div>

      <div className="flex-grow overflow-y-auto p-4 pt-0">
        <div className="w-full max-w-md mx-auto">
          
          {!isPhoneStep && showStepper && (
            <ProgressStepper
              currentStepIndex={currentStep -1} // Adjust index because step 0 is initial screen
              steps={stepLabels}
              className="mb-6 w-full"
            />
          )}

          {showStepTitle && ActiveIcon && activeTitle && (
            <div className={cn(
              "mb-6 flex items-center justify-center font-semibold space-x-3 text-foreground font-heading-style",
              isPhoneStep ? "text-2xl sm:text-3xl" : "text-lg sm:text-xl" 
            )}>
              <ActiveIcon className={cn(isPhoneStep ? "h-7 w-7" : "h-6 w-6", "text-primary")} />
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

    