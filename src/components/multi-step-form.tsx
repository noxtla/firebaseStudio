
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import type { FormData, FormStep, UserData, CapturedLocation } from '@/types'; // Added CapturedLocation
import { useToast } from "@/hooks/use-toast";

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

const initialFormData: FormData = {
  phoneNumber: '',
  ssnLast4: '',
  birthDay: '',
};

const MAX_STEPS: FormStep = 5;

const stepLabels = ["Phone", "SSN", "Birth Day", "Photo", "Done"];

const STEP_CONFIG = [
  { title: "", icon: null }, // Initial Screen (Step 0)
  { title: "Enter Your Phone Number", icon: Phone }, // Step 1
  { title: "Enter Last 4 of SSN", icon: Info }, // Step 2
  { title: "Day of Birth", icon: CalendarDays }, // Step 3
  { title: "Take a Photo", icon: CameraIconLucide }, // Step 4
  { title: "Review Your Information", icon: CheckCircle2 }, // Step 5 (CompletionScreen handles its own title)
];

const formatInitialsForDisplay = (initials: string): string => {
  return initials
    .split('')
    .map(char => `${char}****`)
    .join(' ');
};

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [captureTimestamp, setCaptureTimestamp] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userInitials, setUserInitials] = useState<string | null>(null);
  const [isLoadingPhoneNumber, setIsLoadingPhoneNumber] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<string | null>(null);
  const { toast } = useToast();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      const cleaned = ('' + value).replace(/\D/g, '');
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        let formatted = '';
        if (match[1]) formatted += `(${match[1]}`;
        if (match[2]) formatted += `) ${match[2]}`;
        if (match[3]) formatted += `-${match[3]}`;
        setFormData((prev) => ({ ...prev, [name]: formatted.trim() }));
        return;
      }
    }
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
    if (isLoadingPhoneNumber && currentStep === 1) return false;

    switch (currentStep) {
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
        return !!capturedImage;
      default:
        return true;
    }
  };

  const canProceed = getCanProceed();

  const nextStep = async () => {
    if (currentStep === 1 && canProceed) {
      setIsLoadingPhoneNumber(true);
      setUserData(null);
      setUserInitials(null);
      setRawApiResponse(null);
      const cleanedPhoneNumber = formData.phoneNumber.replace(/\D/g, '');
      const webhookUrl = 'https://n8n.srv809556.hstgr.cloud/webhook-test/v1';
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
              const responseData: UserData[] = JSON.parse(responseText);
              if (responseData && responseData.length > 0 && responseData[0].Name) {
                setUserData(responseData[0]);
                const nameParts = responseData[0].Name.split(' ');
                const initials = nameParts.map(part => part.charAt(0).toUpperCase()).join('');
                setUserInitials(initials);
                toast({ title: "Success", description: "Phone number verified." });
                setCurrentStep((prev) => (prev + 1) as FormStep);
              } else {
                toast({ variant: "destructive", title: "Error", description: "User not found or name missing in response." });
              }
            } catch (jsonError) {
              console.error('Error parsing JSON:', jsonError, 'Response text:', responseText);
              toast({ variant: "destructive", title: "Error", description: "Received an invalid response from the server." });
            }
          } else {
             toast({ variant: "destructive", title: "Error", description: "User not found or empty response from server." });
          }
        } else {
          const errorDetails = responseText || `Status: ${response.status}`;
          toast({ variant: "destructive", title: "Error", description: `Failed to verify phone number: ${errorDetails}.` });
        }
      } catch (error) {
        console.error('Error sending phone number to webhook:', error);
        toast({ variant: "destructive", title: "Error", description: "An error occurred while verifying your phone number." });
         if (error instanceof Error) {
          setRawApiResponse(`Fetch Error: ${error.message}`);
        } else {
          setRawApiResponse('Fetch Error: An unknown error occurred.');
        }
      } finally {
        setIsLoadingPhoneNumber(false);
      }
    } else if (currentStep < MAX_STEPS && canProceed) {
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
      if (currentStep === 2) {
        setFormData(prev => ({...prev, ssnLast4: ''}));
      }
      if (currentStep === 3) setFormData(prev => ({...prev, birthDay: ''}));
      if (currentStep === 4) {
        setCapturedImage(null);
        setCaptureTimestamp(null);
        setCapturedLocation(null);
      }
      if (currentStep === 1) { // Going back to step 0 from step 1
        setUserData(null);
        setUserInitials(null);
        setRawApiResponse(null);
      }
       if (currentStep === 2 && currentStep -1 === 1) { // Going back to step 1 (phone) from step 2 (SSN)
         // Keep userData and userInitials if we are going back to step 1 from step 2
         // but clear ssnLast4, which is already done above.
       } else if (currentStep > 1) { // Reset user data if going back further than phone step
           setUserData(null);
           setUserInitials(null);
           setRawApiResponse(null);
       }
    }
  };

  const restartForm = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    setCapturedImage(null);
    setCaptureTimestamp(null);
    setCapturedLocation(null);
    setUserData(null);
    setUserInitials(null);
    setIsLoadingPhoneNumber(false);
    setRawApiResponse(null);
  };

  let formattedUserInitialsForStep: string | null = null;
  if (userInitials && (currentStep === 2 || currentStep === 3 || currentStep === 4)) {
    formattedUserInitialsForStep = formatInitialsForDisplay(userInitials);
  }

  const renderActiveStepContent = () => {
    switch (currentStep) {
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

  if (currentStep === 0) {
    return <InitialScreen onNextStep={nextStep} />;
  }

  const ActiveIcon = STEP_CONFIG[currentStep]?.icon;
  const activeTitle = STEP_CONFIG[currentStep]?.title;
  
  const showAppHeader = currentStep > 0 && currentStep <= MAX_STEPS;
  const showStepper = currentStep > 0 && currentStep <= MAX_STEPS;
  const showStepTitle = currentStep > 0 && currentStep < MAX_STEPS; // Don't show for step 5 (Done)
  const showNavButtons = currentStep > 0 && currentStep < MAX_STEPS;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="flex-grow overflow-y-auto p-4 pt-6 sm:pt-8 md:pt-12">
        <div className="w-full max-w-md mx-auto">
          {showAppHeader && <AppHeader className="mb-8" />}

          {showStepper && (
            <ProgressStepper
              currentStepIndex={currentStep - 1}
              steps={stepLabels}
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
        </div>
      </div>

      {showNavButtons && (
        <div className="sticky bottom-0 left-0 right-0 bg-background p-4 border-t border-border shadow-md">
          <div className="w-full max-w-md mx-auto flex justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1 && (!userData || isLoadingPhoneNumber)}
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
        </div>
      )}
    </div>
  );
}
