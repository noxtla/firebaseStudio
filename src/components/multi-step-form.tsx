
"use client";

import { useState, type ChangeEvent } from 'react';
import type { FormData, FormStep } from '@/types';

import AppHeader from './app-header';
import ProgressStepper from './progress-stepper';
import InitialScreen from './steps/initial-screen';
import PhoneNumberStep from './steps/phone-number-step';
import SsnStep from './steps/ssn-step';
import BirthDayStep from './steps/birth-day-step';
import PhotoStep from './steps/photo-step';
import CompletionScreen from './steps/completion-screen';

import { Button } from '@/components/ui/button';
import { Phone, Info, CalendarDays, Camera, CheckCircle2, ArrowLeft, ArrowRight } from 'lucide-react';
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
  { title: "Review Your Information", icon: CheckCircle2 }, // Step 5, updated title
];

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

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

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoCaptured = (imageDataUrl: string | null) => {
    setCapturedImage(imageDataUrl);
  };

  const getCanProceed = (): boolean => {
    switch (currentStep) {
      case 1: // Phone Number
        return formData.phoneNumber.replace(/\D/g, '').length === 10;
      case 2: // SSN
        return formData.ssnLast4.length === 4 && /^\d{4}$/.test(formData.ssnLast4);
      case 3: // Birth Day
        const day = parseInt(formData.birthDay, 10);
        return !isNaN(day) && day >= 1 && day <= 31 && formData.birthDay.length > 0 && formData.birthDay.length <= 2 ;
      case 4: // Photo
        return !!capturedImage;
      default: 
        return true; 
    }
  };
  
  const canProceed = getCanProceed();

  const nextStep = async () => {
    if (currentStep < MAX_STEPS) {
      // Send phone number to webhook when transitioning from Phone Number step (step 1)
      if (currentStep === 1 && canProceed) {
        const cleanedPhoneNumber = formData.phoneNumber.replace(/\D/g, '');
        const webhookUrl = 'https://n8n.srv809556.hstgr.cloud/webhook-test/v1'; // Updated webhook URL
        try {
          const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phoneNumber: cleanedPhoneNumber }),
          });
          if (response.ok) {
            console.log('Phone number sent to webhook successfully.');
          } else {
            console.error('Failed to send phone number to webhook:', response.status, await response.text());
          }
        } catch (error) {
          console.error('Error sending phone number to webhook:', error);
        }
      }
      setCurrentStep((prev) => (prev + 1) as FormStep);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) { 
      setCurrentStep((prev) => (prev - 1) as FormStep);
    }
  };

  const restartForm = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    setCapturedImage(null);
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
            onRestart={restartForm}
          />
        );
      default: 
        // InitialScreen is handled outside this switch by returning it directly if currentStep is 0
        return null; 
    }
  };

  if (currentStep === 0) {
    return <InitialScreen onNextStep={nextStep} />;
  }

  const ActiveIcon = STEP_CONFIG[currentStep]?.icon;
  const activeTitle = STEP_CONFIG[currentStep]?.title;

  // Conditional rendering for AppHeader in MultiStepForm
  const showAppHeader = currentStep > 0; 
  const showStepper = currentStep > 0 && currentStep <= MAX_STEPS;
  const showStepTitle = currentStep > 0 && currentStep < MAX_STEPS; 
  const showNavButtons = currentStep > 0 && currentStep < MAX_STEPS;

  return (
    <div className="flex flex-col min-h-screen bg-background"> {/* Use bg-background for steps 1-5 */}
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
            <div className="mt-12 flex justify-between"> {/* Increased mt-8 to mt-12 for more space */}
              <Button 
                variant="ghost" 
                onClick={prevStep} 
                disabled={currentStep === 1} 
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button onClick={nextStep} disabled={!canProceed}>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
