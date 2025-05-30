
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { FormData, FormStep, UserData } from '@/types'; // UserData should be imported
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
// ProgressStepper will not be shown on the phone number step
// import ProgressStepper from './progress-stepper';
import InitialScreen from './steps/initial-screen';
import PhoneNumberStep from './steps/phone-number-step';

import { Button } from '@/components/ui/button';
import { Phone, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";

const initialFormData: Pick<FormData, 'phoneNumber'> = {
  phoneNumber: '',
};

const MAX_STEPS: FormStep = 1; // Only phone number step before redirect

const STEP_CONFIG = [
  { title: "Welcome", icon: null }, // Step 0
  { title: "Enter Your Phone Number", icon: Phone }, // Step 1
];

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
  const [formData, setFormData] = useState<Pick<FormData, 'phoneNumber'>>(initialFormData);
  const [isLoadingPhoneNumber, setIsLoadingPhoneNumber] = useState(false);
  const [rawApiResponse, setRawApiResponse] = useState<string | null>(null);
  const [isNotFoundAlertOpen, setIsNotFoundAlertOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (currentStep === 0) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('loginWebhookStatus');
        sessionStorage.removeItem('rawApiResponse');
        sessionStorage.removeItem('currentTruckNumber');
      }
    }
  }, [currentStep]);

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

  const restartForm = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    setUserData(null);
    setIsLoadingPhoneNumber(false);
    setRawApiResponse(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('loginWebhookStatus');
      sessionStorage.removeItem('rawApiResponse');
      sessionStorage.removeItem('currentTruckNumber');
    }
  };

  const nextStep = async () => {
    setRawApiResponse(null);

    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1 && canProceed) {
      setIsLoadingPhoneNumber(true);
      setUserData(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('loginWebhookStatus');
      }

      const cleanedPhoneNumber = formData.phoneNumber.replace(/\D/g, '');
      const webhookUrl = 'https://n8n.srv809556.hstgr.cloud/webhook/login';
      const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: cleanedPhoneNumber }),
      };

      console.log('[MultiStepForm] Calling webhook:', webhookUrl);
      console.log('[MultiStepForm] Request options:', requestOptions);

      try {
        const response = await fetch(webhookUrl, requestOptions);
        
        console.log('[MultiStepForm] Webhook response status:', response.status);
        console.log('[MultiStepForm] Webhook response statusText:', response.statusText);
        console.log('[MultiStepForm] Webhook response ok:', response.ok);
        
        const responseHeaders: Record<string, string> = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        console.log('[MultiStepForm] Webhook response headers:', responseHeaders);

        const responseText = await response.text();
        console.log('[MultiStepForm] Raw webhook responseText:', responseText);
        setRawApiResponse(responseText);
        if (typeof window !== 'undefined') sessionStorage.setItem('rawApiResponse', responseText);

        if (response.ok) { // Status 200-299
          if (responseText) {
            try {
              console.log('[MultiStepForm] Attempting to parse responseText as JSON:', responseText);
              const parsedData = JSON.parse(responseText);
              console.log('[MultiStepForm] Parsed JSON data:', parsedData);

              if (typeof parsedData === 'object' && parsedData !== null && 'myField' in parsedData && parsedData.myField === "NO EXISTE") {
                toast({ variant: "destructive", title: "User Not Found", description: "User not found. Please check the phone number and try again." });
              } else if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].Name) {
                const fetchedUserData: UserData = { ...parsedData[0], phoneNumber: cleanedPhoneNumber };
                setUserData(fetchedUserData);
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('userData', JSON.stringify(fetchedUserData));
                  sessionStorage.setItem('loginWebhookStatus', response.status.toString());
                }
                toast({ variant: "success", title: "Success", description: "Phone number verified. Redirecting..." });
                router.push('/main-menu');
              } else {
                console.error('[MultiStepForm] Response OK, but not "NO EXISTE" and not valid user data array. Parsed data:', parsedData);
                toast({ variant: "destructive", title: "User Data Error", description: "User data not found or invalid data received from server. Check console for details." });
              }
            } catch (jsonError: any) {
              console.error("[MultiStepForm] JSON Parse Error:", jsonError, "Raw ResponseText was:", responseText);
              toast({ variant: "destructive", title: "Response Format Error", description: `Received an invalid response format from the server. Check console for details. Response: ${responseText.substring(0,100)}...` });
            }
          } else { // Response OK, but empty responseText
            console.warn('[MultiStepForm] Response OK, but empty responseText from server.');
            toast({ variant: "destructive", title: "Empty Success Response", description: `Server responded with status ${response.status} but no content.` });
             // Do not navigate if user data is expected but not received.
          }
        } else if (response.status === 404) {
          setIsNotFoundAlertOpen(true);
        } else if (response.status === 503) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('userData');
            sessionStorage.setItem('loginWebhookStatus', response.status.toString());
          }
          toast({ variant: "default", title: "Service Unavailable", description: "Service temporarily unavailable. Proceeding to the main menu, some features may be limited." });
          router.push('/main-menu');
        } else {
          console.error(`[MultiStepForm] Webhook call failed with status: ${response.status}. ResponseText: ${responseText}`);
          toast({ variant: "destructive", title: "Verification Error", description: `Failed to verify phone number. Status: ${response.status}. ${responseText ? `Details: ${responseText.substring(0,100)}...` : 'No details in response.'} Check console for full details.` });
        }
      } catch (error: any) {
        console.error("[MultiStepForm] Phone Verification Fetch Error:", error);
        setRawApiResponse(error.message || "Fetch failed");
        if (typeof window !== 'undefined') sessionStorage.setItem('rawApiResponse', error.message || "Fetch failed");

        toast({
          variant: "destructive",
          title: "Network Error",
          description: `Could not connect to the verification service. Please check your internet connection and the server status at ${webhookUrl}. See console for more details.`,
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
    <div className={cn("flex flex-col min-h-screen", currentStep === 0 ? "bg-card" : "bg-background")}>
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
      
      <div className={cn("w-full max-w-md mx-auto px-4", { "pt-8": currentStep === 1 })}>
        {showStepper && (
          // ProgressStepper logic would be here if enabled for this step
          <p>Stepper would be here</p>
        )}
        {showStepTitle && ActiveIcon && activeTitle && (
          <div className={cn(
            "mb-6 flex items-center justify-center font-semibold space-x-3 text-foreground font-heading-style",
             "text-2xl sm:text-3xl" // Increased title size
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
