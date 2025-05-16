
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import type { FormData, FormStep, UserData } from '@/types';
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
import { Phone, Info, CalendarDays, Camera, CheckCircle2, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
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
  { title: "Take a Photo", icon: Camera }, // Step 4
  { title: "Review Your Information", icon: CheckCircle2 }, // Step 5
];

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoadingPhoneNumber, setIsLoadingPhoneNumber] = useState(false);
  // apiError state is removed, using toasts directly for feedback
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

  const handlePhotoCaptured = (imageDataUrl: string | null) => {
    setCapturedImage(imageDataUrl);
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
        // Validate against userData.dataBirth
        try {
          const [year, month] = userData.dataBirth.split('-').map(Number);
          const userEnteredFullDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          return userEnteredFullDate === userData.dataBirth;
        } catch (e) {
          return false; // Error parsing date
        }
      case 4: // Photo
        return !!capturedImage;
      default:
        return true;
    }
  };

  const canProceed = getCanProceed();

  const nextStep = async () => {
    if (currentStep === 1 && canProceed) { // Phone Number step
      setIsLoadingPhoneNumber(true);
      setUserData(null); // Clear previous user data
      const cleanedPhoneNumber = formData.phoneNumber.replace(/\D/g, '');
      const webhookUrl = 'https://n8n.srv809556.hstgr.cloud/webhook-test/v1';
      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: cleanedPhoneNumber, phoneNumberFlag: true }),
        });

        if (response.ok) {
          const responseData: UserData[] = await response.json();
          if (responseData && responseData.length > 0) {
            setUserData(responseData[0]);
            toast({ title: "Success", description: "Phone number verified." });
            setCurrentStep((prev) => (prev + 1) as FormStep);
          } else {
            toast({ variant: "destructive", title: "Error", description: "User not found with this phone number." });
          }
        } else {
          const errorText = await response.text();
          toast({ variant: "destructive", title: "Error", description: `Failed to verify phone number: ${response.status} ${errorText}` });
        }
      } catch (error) {
        console.error('Error sending phone number to webhook:', error);
        toast({ variant: "destructive", title: "Error", description: "An error occurred while verifying your phone number." });
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
       // Optionally clear specific form data for the step being left
      if (currentStep === 2) setFormData(prev => ({...prev, ssnLast4: ''}));
      if (currentStep === 3) setFormData(prev => ({...prev, birthDay: ''}));
      if (currentStep === 4) setCapturedImage(null);
      // Do not clear userData when going back from SSN to Phone,
      // as user might want to re-verify or it might be cleared on next Phone submission.
      // However, if going back from BirthDay to SSN, userData is still relevant.
    }
  };

  const restartForm = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    setCapturedImage(null);
    setUserData(null);
    setIsLoadingPhoneNumber(false);
  };

  const renderActiveStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PhoneNumberStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 2:
        return (
          <SsnStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 3:
        return (
          <BirthDayStep
            formData={formData}
            onInputChange={handleInputChange}
            userData={userData}
          />
        );
      case 4:
        return (
          <PhotoStep
            onPhotoCaptured={handlePhotoCaptured}
            capturedImage={capturedImage}
          />
        );
      case 5:
        return (
          <CompletionScreen
            formData={formData}
            capturedImage={capturedImage}
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

  const showAppHeader = currentStep > 0;
  const showStepper = currentStep > 0 && currentStep <= MAX_STEPS;
  const showStepTitle = currentStep > 0 && currentStep < MAX_STEPS;
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

          {showNavButtons && (
            <div className="mt-12 flex justify-between">
              <Button
                variant="ghost"
                onClick={prevStep}
                disabled={currentStep === 1}
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
