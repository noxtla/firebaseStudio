
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
// SSN, BirthDay, Photo, Completion steps are no longer directly used here
// after the flow change to redirect to main-menu.

import { Button } from '@/components/ui/button';
import { Phone, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";

const initialFormData: Pick<FormData, 'phoneNumber'> = { // Only phoneNumber needed for this form now
  phoneNumber: '',
};

const MAX_STEPS: FormStep = 1; // 0: Initial, 1: Phone (then redirect)

const STEP_CONFIG = [
  { title: "", icon: null }, // Initial Screen (Step 0)
  { title: "Enter Your Phone Number", icon: Phone }, // Step 1
];

const stepLabels = ["Phone"]; // Only "Phone" relevant for this form's stepper

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
  const [formData, setFormData] = useState<FormData>(initialFormData as FormData); // Cast to full FormData
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingPhoneNumber, setIsLoadingPhoneNumber] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [rawApiResponse, setRawApiResponse] = useState<string | null>(null);
  const [isNotFoundAlertOpen, setIsNotFoundAlertOpen] = useState(false);

  // userInitials state is no longer needed here as SSN/BirthDay/Photo steps moved
  // const [userInitials, setUserInitials] = useState<string | null>(null);

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
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // handlePhotoCaptured is no longer needed in this component

  const getCanProceed = (): boolean => {
    if (isLoadingPhoneNumber && currentStep === 1) return false;

    switch (currentStep) {
      case 0: // Initial Screen
        return true;
      case 1: // Phone Number
        return formData.phoneNumber.replace(/\D/g, '').length === 10;
      default: // Other steps (SSN, BirthDay, Photo) are no longer part of this form
        return false;
    }
  };

  const canProceed = getCanProceed();

  const nextStep = async () => {
    setApiError(null);

    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1 && canProceed) {
      setIsLoadingPhoneNumber(true);
      setRawApiResponse(null);
      setUserData(null);
      const cleanedPhoneNumber = formData.phoneNumber.replace(/\D/g, '');
      const webhookUrl = 'https://n8n.srv809556.hstgr.cloud/webhook-test/login';
      
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: cleanedPhoneNumber }), // phoneNumberFlag removed
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
                sessionStorage.setItem('userData', JSON.stringify(userDataInstance));
                toast({ variant: "success", title: "Success", description: "Phone number verified. Redirecting..." });
                router.push('/main-menu');
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
      return;
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
      setApiError(null);
    }
  };

  const restartForm = () => {
    setCurrentStep(0);
    setFormData(initialFormData as FormData);
    setUserData(null);
    setIsLoadingPhoneNumber(false);
    setApiError(null);
    setRawApiResponse(null);
    // No need to clear photo/location/initials state here anymore
    sessionStorage.removeItem('userData');
  };

  // formattedUserInitialsForStep is no longer needed here

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
      default: // SSN, BirthDay, Photo, Complete steps are handled in AttendanceForm
        return null;
    }
  };
  
  const ActiveIcon = STEP_CONFIG[currentStep]?.icon;
  let activeTitle = STEP_CONFIG[currentStep]?.title;
  
  const showAppHeader = currentStep > 0 && currentStep <= MAX_STEPS;
  const showStepper = currentStep > 0 && currentStep <= MAX_STEPS;
  const showStepTitle = currentStep > 0 && currentStep < MAX_STEPS;
  const showNavButtons = currentStep > 0 && currentStep < MAX_STEPS;

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

      <div className={cn("w-full max-w-md mx-auto", {"pt-0": isPhoneStep })}>
         {/* Conditional rendering of AppHeader for phone step vs other contexts */}
        {isPhoneStep ? null : <AppHeader className="my-8" /> }
      </div>

      <div className="flex-grow overflow-y-auto p-4 pt-0">
        <div className="w-full max-w-md mx-auto">
          
          {!isPhoneStep && showStepper && (
            <ProgressStepper
              currentStepIndex={currentStep -1} 
              steps={stepLabels}
              className="mb-6 w-full"
            />
          )}
          
          {/* Special handling for AppHeader and Title on Phone Step */}
          {isPhoneStep && (
            <>
              <AppHeader className="my-8" /> 
              {ActiveIcon && activeTitle && (
                <div className={cn(
                  "mb-6 flex items-center justify-center font-semibold space-x-3 text-foreground font-heading-style",
                  "text-2xl sm:text-3xl"
                )}>
                  <ActiveIcon className={cn("h-7 w-7", "text-primary")} />
                  <span>{activeTitle}</span>
                </div>
              )}
            </>
          )}

          {!isPhoneStep && showStepTitle && ActiveIcon && activeTitle && (
            <div className={cn(
              "mb-6 flex items-center justify-center font-semibold space-x-3 text-foreground font-heading-style",
              "text-lg sm:text-xl" 
            )}>
              <ActiveIcon className={cn("h-6 w-6", "text-primary")} />
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
