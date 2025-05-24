
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
import ProgressStepper from './progress-stepper';
import InitialScreen from './steps/initial-screen';
import PhoneNumberStep from './steps/phone-number-step';

import { Button } from '@/components/ui/button';
import { Phone, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";

const initialFormData: Pick<FormData, 'phoneNumber'> = {
  phoneNumber: '',
};

const MAX_PHONE_FORM_STEP: FormStep = 1; // 0:Initial, 1:Phone (then navigate)

// phoneStepLabels is not used if ProgressStepper is always hidden
// const phoneStepLabels = ["Initial", "Phone"];
const PHONE_STEP_CONFIG = [
  { title: "Welcome", icon: null }, // Step 0 (Initial)
  { title: "Enter Your Phone Number", icon: Phone }, // Step 1 (Phone)
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
    }
  };

  const getCanProceed = (): boolean => {
    if (isLoadingPhoneNumber) return false;
    switch (currentStep) {
      case 0: // Initial Screen
        return true;
      case 1: // Phone Number
        return formData.phoneNumber.replace(/\D/g, '').length === 10;
      default:
        return false;
    }
  };

  const canProceed = getCanProceed();

  const nextStep = async () => {
    setRawApiResponse(null);

    if (currentStep === 0) { // Initial to Phone
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1 && canProceed) { // Phone to SSN (now Main Menu)
      setIsLoadingPhoneNumber(true);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('loginWebhookStatus');
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
        
        if (typeof window !== 'undefined') {
            sessionStorage.setItem('loginWebhookStatus', response.status.toString());
        }

        if (response.ok) {
          if (responseText) {
            try {
              const parsedData = JSON.parse(responseText);
              if (typeof parsedData === 'object' && parsedData !== null && parsedData.myField === "NO EXISTE") {
                toast({ variant: "destructive", title: "Error", description: "User not found. Please check the phone number and try again." });
              } else if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].Name) {
                const fetchedUserData: UserData = { ...parsedData[0], phoneNumber: cleanedPhoneNumber }; // Add entered phone to userData
                if (typeof window !== 'undefined') {
                    sessionStorage.setItem('userData', JSON.stringify(fetchedUserData));
                }
                toast({ variant: "success", title: "Success", description: "Phone number verified. Redirecting to menu..." });
                router.push('/main-menu');
              } else {
                // console.error('Unexpected JSON structure:', parsedData);
                toast({ variant: "destructive", title: "Error", description: "User not found or invalid data received." });
              }
            } catch (jsonError) {
              // console.error('Error parsing JSON:', jsonError, 'Response text:', responseText);
              toast({ variant: "destructive", title: "Error", description: "Received an invalid response from the server." });
            }
          } else { 
            toast({ variant: "destructive", title: "Error", description: "User not found or empty response from server." });
          }
        } else { 
          if (response.status === 404) {
            setIsNotFoundAlertOpen(true);
          } else {
            const errorDetails = responseText || `Status: ${response.status}`;
            toast({ variant: "destructive", title: "Error", description: `Failed to verify phone number. ${errorDetails}.` });
          }
        }
      } catch (error: any) {
        // console.error('Error sending phone number to webhook:', error);
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
    }
  };

  const restartForm = () => {
    setCurrentStep(0);
    setFormData({ phoneNumber: ''});
    setIsLoadingPhoneNumber(false);
    setRawApiResponse(null);
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('loginWebhookStatus');
    }
  };
  
  const ActiveIcon = currentStep > 0 ? PHONE_STEP_CONFIG[currentStep]?.icon : null;
  const activeTitle = currentStep > 0 ? PHONE_STEP_CONFIG[currentStep]?.title : "";
  
  const showAppHeader = currentStep !== 0; 
  const showStepper = false; // Always false to remove the stepper
  const showStepTitle = currentStep === 1; // Only show title on phone input step
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
      
      <div className={cn("w-full max-w-md mx-auto", {"pt-0": currentStep === 0, "pt-6 sm:pt-8 md:pt-12": currentStep !==0 })}>
        {showAppHeader && <AppHeader className="my-8" />}
      </div>
       
      <div className={cn("w-full max-w-md mx-auto", {"px-4": currentStep !==0 } )}>
        {showStepper && (
          <ProgressStepper
            currentStepIndex={0} 
            steps={["Phone"]} 
            className="mb-6 w-full"
          />
        )}
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
