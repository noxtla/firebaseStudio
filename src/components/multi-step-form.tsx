
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { FormData, FormStep, UserData } from '@/types';
import { useToast } from "@/hooks/use-toast";
// Toaster is in layout.tsx or parent page

import AppHeader from './app-header';
import ProgressStepper from './progress-stepper';
import InitialScreen from './steps/initial-screen';
import PhoneNumberStep from './steps/phone-number-step';

import { Button } from '@/components/ui/button';
import { Phone, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const initialFormData: Pick<FormData, 'phoneNumber'> = {
  phoneNumber: '',
};

// Simplified steps for phone login only
const MAX_PHONE_STEPS: FormStep = 1; // 0: Initial, 1: Phone
const phoneStepLabels = ["Phone"]; // Kept for potential future use, but stepper is hidden
const PHONE_STEP_CONFIG = [
  { title: "", icon: null }, // Initial Screen (Step 0)
  { title: "Enter Your Phone Number", icon: Phone }, // Step 1
];

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState<0 | 1>(0); // Simplified step type
  const [formData, setFormData] = useState<Pick<FormData, 'phoneNumber'>>(initialFormData);
  const [isLoadingPhoneNumber, setIsLoadingPhoneNumber] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === "phoneNumber") {
      // Allow only digits and format as (XXX) XXX-XXXX
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
  };

  const getCanProceed = (): boolean => {
    if (isLoadingPhoneNumber && currentStep === 1) return false;
    if (currentStep === 1) { // Phone Number
      return formData.phoneNumber.replace(/\D/g, '').length === 10;
    }
    return true; // For step 0 (InitialScreen)
  };

  const canProceed = getCanProceed();

  const nextStep = async () => {
    if (currentStep === 0) { // From InitialScreen to PhoneNumberStep
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1 && canProceed) { // Phone Number submission
      setIsLoadingPhoneNumber(true);
      setRawApiResponse(null);
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

        if (response.ok && responseText) {
          try {
            const responseDataArray: UserData[] = JSON.parse(responseText);
            if (responseDataArray && responseDataArray.length > 0 && responseDataArray[0].Name) {
              const userData: UserData = responseDataArray[0];
              sessionStorage.setItem('userData', JSON.stringify(userData));
              
              toast({ variant: "success", title: "Success", description: "Phone number verified." });
              router.push('/main-menu');
            } else {
              toast({ variant: "destructive", title: "Error", description: "User not found or name missing in response." });
            }
          } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError, 'Response text:', responseText);
            toast({ variant: "destructive", title: "Error", description: "Received an invalid response from the server." });
          }
        } else if (response.ok && !responseText) {
            toast({ variant: "destructive", title: "Error", description: "User not found or empty response from server." });
        } else {
          const errorDetails = responseText || `Status: ${response.status}`;
          toast({ variant: "destructive", title: "Error", description: `Failed to verify phone number. Status: ${errorDetails}.` });
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
      } finally {
        setIsLoadingPhoneNumber(false);
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as 0 | 1);
    }
  };

  const restartForm = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    setIsLoadingPhoneNumber(false);
    setRawApiResponse(null);
    sessionStorage.removeItem('userData');
  };

  const renderActiveStepContent = () => {
    if (currentStep === 1) {
      return (
        <PhoneNumberStep
          formData={formData}
          onInputChange={handleInputChange}
          rawApiResponse={rawApiResponse}
        />
      );
    }
    return null; 
  };

  if (currentStep === 0) {
    return <InitialScreen onNextStep={nextStep} />;
  }

  const ActiveIcon = PHONE_STEP_CONFIG[currentStep]?.icon;
  const activeTitle = PHONE_STEP_CONFIG[currentStep]?.title;
  
  const showAppHeader = currentStep > 0 && currentStep <= MAX_PHONE_STEPS;
  const showStepper = false; // Changed to false to hide the stepper
  const showStepTitle = currentStep > 0 && currentStep < MAX_PHONE_STEPS + 1; 
  const showNavButtons = currentStep > 0 && currentStep < MAX_PHONE_STEPS +1;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto">
        {showAppHeader && <AppHeader className="mt-8 mb-8" />}
        {/* Toaster is managed globally or by parent pages */}
      </div>

      <div className="flex-grow overflow-y-auto p-4 pt-0">
        <div className="w-full max-w-md mx-auto">
          
          {showStepper && (
            <ProgressStepper
              currentStepIndex={currentStep - 1} 
              steps={phoneStepLabels}
              className="mb-6 w-full"
            />
          )}

          {showStepTitle && ActiveIcon && activeTitle && (
            <div className={cn(
              "mb-6 flex items-center justify-center text-2xl sm:text-3xl font-semibold space-x-3 text-foreground", // Increased text size and space
              "font-heading-style" 
            )}>
              <ActiveIcon className="h-7 w-7 text-primary" /> {/* Increased icon size */}
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
                disabled={currentStep === 1 && isLoadingPhoneNumber} 
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
