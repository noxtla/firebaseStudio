
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
import InitialScreen from './steps/initial-screen';
import PhoneNumberStep from './steps/phone-number-step';

import { Button } from '@/components/ui/button';
import { Phone, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
// ProgressStepper is not used here anymore

const initialFormData: Pick<FormData, 'phoneNumber'> = {
  phoneNumber: '',
};

const MAX_STEPS: FormStep = 1; // 0: Initial, 1: Phone (then redirect)

// STEP_CONFIG simplified as stepper and titles are mostly for phone step here
const STEP_CONFIG = [
  { title: "Welcome", icon: null },
  { title: "Enter Your Phone Number", icon: Phone },
];

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
  const [formData, setFormData] = useState<Pick<FormData, 'phoneNumber'>>(initialFormData);
  const [isLoadingPhoneNumber, setIsLoadingPhoneNumber] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<string | null>(null);
  const [isNotFoundAlertOpen, setIsNotFoundAlertOpen] = useState(false);

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

  const getCanProceed = (): boolean => {
    if (isLoadingPhoneNumber) return false;
    switch (currentStep) {
      case 0:
        return true;
      case 1:
        return formData.phoneNumber.replace(/\D/g, '').length === 10;
      default:
        return false;
    }
  };

  const canProceed = getCanProceed();

  const nextStep = async () => {
    setRawApiResponse(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('rawApiResponse');
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('loginWebhookStatus');
    }

    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1 && canProceed) {
      setIsLoadingPhoneNumber(true);

      const cleanedPhoneNumber = formData.phoneNumber.replace(/\D/g, '');
      const webhookUrl = 'http://3.145.55.33/webhook-test/phoneNumber';

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

        if (response.ok) {
          if (responseText) {
            try {
              const parsedData = JSON.parse(responseText);
              if (typeof parsedData === 'object' && parsedData !== null && parsedData.myField === "NO EXISTE") {
                toast({ variant: "destructive", title: "User Not Found", description: "User not found. Please check the phone number and try again." });
              } else if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].Name) {
                const fetchedUserData: UserData = { ...parsedData[0], phoneNumber: cleanedPhoneNumber };
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('userData', JSON.stringify(fetchedUserData));
                  sessionStorage.setItem('loginWebhookStatus', responseStatus.toString());
                }
                toast({ variant: "success", title: "Success", description: "Phone number verified. Redirecting..." });
                router.push('/main-menu');
              } else {
                 toast({ variant: "destructive", title: "User Not Found", description: "User data not found or invalid data received." });
              }
            } catch (jsonError) {
              console.error("JSON Parse Error:", jsonError, "Raw Response:", responseText);
              toast({ variant: "destructive", title: "Error", description: "Received an invalid response from the server." });
            }
          } else {
             toast({ variant: "destructive", title: "Error", description: "User not found or empty response from server." });
          }
        } else if (responseStatus === 404) {
          setIsNotFoundAlertOpen(true);
        } else if (responseStatus === 503) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('userData'); 
            sessionStorage.setItem('loginWebhookStatus', responseStatus.toString());
          }
          toast({ variant: "default", title: "Service Unavailable", description: "Service temporarily unavailable. Proceeding to menu, some features may be limited."});
          router.push('/main-menu');
        }
        else {
          toast({ variant: "destructive", title: "Error", description: `Failed to verify phone number. Status: ${responseStatus}. ${responseText ? `Details: ${responseText}` : ''}` });
        }
      } catch (error: any) {
        let userFriendlyMessage = "Network Error: Could not connect to the verification service. Please check the server status and your browser's developer console for more details. Ensure the server at http://3.145.55.33 is running and CORS is configured if necessary.";
        if (error instanceof Error && error.message) {
          userFriendlyMessage = `Network Error: ${error.message}. This might be due to an issue with the server at http://3.145.55.33, your internet connection, or a CORS policy. Please check the server status and your browser's developer console.`;
        }
        console.error("Phone Verification Fetch Error:", error);
        setRawApiResponse(error.message || "Fetch failed"); // Store the actual error message for debugging
        if (typeof window !== 'undefined') sessionStorage.setItem('rawApiResponse', error.message || "Fetch failed");
        
        toast({
          variant: "destructive",
          title: "Network Error",
          description: userFriendlyMessage,
        });
      } finally {
        setIsLoadingPhoneNumber(false);
      }
      return; 
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
      setRawApiResponse(null);
      if (typeof window !== 'undefined') sessionStorage.removeItem('rawApiResponse');
    }
  };

  const ActiveIcon = currentStep > 0 && currentStep <= MAX_STEPS ? STEP_CONFIG[currentStep]?.icon : null;
  const activeTitle = currentStep > 0 && currentStep <= MAX_STEPS ? STEP_CONFIG[currentStep]?.title : "";

  const showAppHeader = currentStep !== 0;
  const showStepper = false; 
  const showStepTitle = currentStep === 1; 
  const showNavButtons = currentStep === 1;

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
      
      <div className="w-full max-w-md mx-auto px-4">
        {/* Toasts appear in the viewport managed by Toaster, not directly here */}
      </div>

      <div className={cn("w-full max-w-md mx-auto px-4", { "hidden": currentStep === 0 })}>
        {showStepTitle && ActiveIcon && activeTitle && (
          <div className={cn(
            "mb-6 flex items-center justify-center font-semibold space-x-3 text-foreground font-heading-style",
            "text-2xl sm:text-3xl" 
          )}>
            <ActiveIcon className={cn("h-7 w-7 sm:h-8 sm:w-8", "text-primary")} />
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
                disabled={isLoadingPhoneNumber || currentStep === 0} 
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button onClick={nextStep} disabled={!canProceed || isLoadingPhoneNumber}>
                {isLoadingPhoneNumber ? (
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
