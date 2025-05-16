
"use client";

import { useState, type ChangeEvent } from 'react';
import type { FormData, FormStep } from '@/types';

import AppHeader from './app-header'; // Renamed from AnimatedLogo
import ProgressStepper from './progress-stepper';
import InitialScreen from './steps/initial-screen';
import PhoneNumberStep from './steps/phone-number-step';
import SsnStep from './steps/ssn-step';
import BirthDayStep from './steps/birth-day-step';
import PhotoStep from './steps/photo-step';
import CompletionScreen from './steps/completion-screen';

import { Phone, Info, CalendarDays, Camera, CheckCircle2 } from 'lucide-react'; // Lucide icons

const initialFormData: FormData = {
  phoneNumber: '',
  ssnLast4: '',
  birthDay: '',
};

const MAX_STEPS: FormStep = 5; // 0: Initial, ..., 5: Completion

const stepLabels = ["Phone", "SSN", "Birth Day", "Photo", "Done"];

const STEP_CONFIG = [
  { title: "", icon: null }, // 0: InitialScreen (no specific title/icon needed here)
  { title: "Enter Your Phone Number", icon: Phone }, // 1: PhoneNumberStep
  { title: "Enter Last 4 of SSN", icon: Info },    // 2: SsnStep
  { title: "Day of Birth", icon: CalendarDays }, // 3: BirthDayStep
  { title: "Take a Photo", icon: Camera },        // 4: PhotoStep
  { title: "Verification Complete!", icon: CheckCircle2 }, // 5: CompletionScreen (uses its own header)
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

  const handlePhotoCaptured = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
  };

  const nextStep = () => {
    if (currentStep < MAX_STEPS) {
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

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <InitialScreen onNextStep={nextStep} />;
      case 1:
        return (
          <PhoneNumberStep
            formData={formData}
            onInputChange={handleInputChange}
            onNextStep={nextStep}
            onPrevStep={prevStep}
          />
        );
      case 2:
        return (
          <SsnStep
            formData={formData}
            onInputChange={handleInputChange}
            onNextStep={nextStep}
            onPrevStep={prevStep}
          />
        );
      case 3:
        return (
          <BirthDayStep
            formData={formData}
            onInputChange={handleInputChange}
            onNextStep={nextStep}
            onPrevStep={prevStep}
          />
        );
      case 4:
        return (
          <PhotoStep
            onPhotoCaptured={handlePhotoCaptured}
            onNextStep={nextStep}
            onPrevStep={prevStep}
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
        return <InitialScreen onNextStep={nextStep} />;
    }
  };

  const ActiveIcon = STEP_CONFIG[currentStep]?.icon;
  const activeTitle = STEP_CONFIG[currentStep]?.title;
  // Show stepper for steps 1 (Phone) through 5 (Done).
  const showStepper = currentStep > 0;
  // Show specific step title for steps 1 (Phone) through 4 (Photo).
  // Step 0 (Initial) and Step 5 (Completion) have their own title/header mechanisms.
  const showStepTitle = currentStep > 0 && currentStep < MAX_STEPS;


  return (
    <div className="w-full flex flex-col items-center">
      <AppHeader className="my-8" />

      {showStepper && (
        <ProgressStepper
          currentStepIndex={currentStep - 1} // 0 for Phone, 1 for SSN, ..., 4 for Done
          steps={stepLabels}
          className="mb-6 w-full px-4 md:px-0" // Added padding for mobile
        />
      )}

      {showStepTitle && ActiveIcon && activeTitle && (
        <div className="mb-6 flex items-center justify-center text-xl font-semibold space-x-2 text-foreground">
          <ActiveIcon className="h-6 w-6 text-primary" />
          <span>{activeTitle}</span>
        </div>
      )}

      <div className="animate-step-enter w-full" key={currentStep}>
        {renderStep()}
      </div>
    </div>
  );
}
