
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
  const [rawApiResponse, setRawApiResponse] = useState<string | null>(null);
  const [isNotFoundAlertOpen, setIsNotFoundAlertOpen] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null); // To store fetched user data

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    // Clear sensitive data from sessionStorage when the form initializes or currentStep resets to 0
    if (currentStep === 0) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('loginWebhookStatus');
        sessionStorage.removeItem('rawApiResponse');
        sessionStorage.removeItem('currentTruckNumber');
        sessionStorage.removeItem('attendanceSubmitted'); // Clear attendance status too
      }
    }
  }, [currentStep]);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "phoneNumber") {
      const cleaned = ('' + value).replace(/\D/g, '');
      if (cleaned.length > 10) return; // Max 10 digits
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
    setRawApiResponse(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('loginWebhookStatus');
      sessionStorage.removeItem('rawApiResponse');
      sessionStorage.removeItem('currentTruckNumber');
      sessionStorage.removeItem('attendanceSubmitted');
    }
  };

  const nextStep = async () => {
    setRawApiResponse(null);

    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1 && canProceed) {
      setUserData(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('loginWebhookStatus');
        sessionStorage.removeItem('attendanceSubmitted'); // Ensure this is cleared before setting new data
      }

      // Create and store mock user data since webhooks are bypassed
      const cleanedPhoneNumber = formData.phoneNumber.replace(/\D/g, '');
      const mockUserData: UserData = {
        Name: "Mock User",
        Puesto: "Mock Position",
        phoneNumber: cleanedPhoneNumber,
        NSS: "1234", // Last 4 digits for SSN verification step
        dataBirth: "1990-01-15", // YYYY-MM-DD, for birth day verification (day: 15)
        Vehicles: ["111-1111", "222-2222", "123-4567"], // Sample vehicle numbers
      };

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('userData', JSON.stringify(mockUserData));
        sessionStorage.setItem('loginWebhookStatus', '200'); // Simulate successful login
      }
      setUserData(mockUserData); // Set local state if needed elsewhere on this component

      toast({ variant: "success", title: "Mock Login Successful", description: "Proceeding with mock user data." });
      router.push('/main-menu');
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
    <div className={cn("flex flex-col min-h-screen")}> {/* Removed bg-background here, applied by parent or globally */}
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

      <div className={cn("w-full max-w-md mx-auto px-4", { "hidden": currentStep === 0 })}>
        {showStepTitle && ActiveIcon && activeTitle && (
          <div className={cn(
            "mb-6 flex items-center justify-center font-semibold space-x-3 text-foreground",
            "text-2xl sm:text-3xl font-heading-style" 
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
                disabled={currentStep === 0}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button onClick={nextStep} disabled={!canProceed}>
                {
                  <>
                    Next <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                }
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
