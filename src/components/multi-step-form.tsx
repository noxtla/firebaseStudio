
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { FormData, FormStep } from '@/types';

import AppHeader from './app-header';
import InitialScreen from './steps/initial-screen';
import PhoneNumberStep from './steps/phone-number-step';

import { Button } from '@/components/ui/button';
import { Phone, ArrowLeft, ArrowRight, Loader2, type LucideIcon } from 'lucide-react'; 
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

const initialFormData: Pick<FormData, 'phoneNumber'> = {
  phoneNumber: '',
};

const MAX_STEPS: FormStep = 1; 

const STEP_CONFIG = [
  { title: "Welcome", icon: null }, 
  { title: "Enter Your Phone Number", icon: Phone }, 
];

export default function MultiStepForm() {
  const [currentStep, setCurrentStep] = useState<FormStep>(0);
  const [formData, setFormData] = useState<Pick<FormData, 'phoneNumber'>>(initialFormData);
  const [isProcessingWebhook, setIsProcessingWebhook] = useState(false);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(false);
  const [welcomeUserName, setWelcomeUserName] = useState('');

  const router = useRouter();
  const { toast } = useToast()

  useEffect(() => {
    if (currentStep === 0) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('currentTruckNumber');
        sessionStorage.removeItem('attendanceSubmitted');
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
    }
  };

  const getCanProceed = (): boolean => {
    return currentStep === 0 ? true : formData.phoneNumber.replace(/\D/g, '').length === 10;
  };

  const canProceed = getCanProceed();

  const restartForm = () => {
    setCurrentStep(0);
    setFormData(initialFormData);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('currentTruckNumber');
      sessionStorage.removeItem('attendanceSubmitted');
    }
  };

  const nextStep = async () => {
    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1 && canProceed) {
      setIsProcessingWebhook(true); 
      try {
        const response = await fetch('https://noxtla.app.n8n.cloud/webhook-test/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ phoneNumber: formData.phoneNumber, action: 'phoneNumberLogin' }),
        });

        if (response.status === 404) {
          const errorData = await response.json();
          if (errorData.Error === "UserNotFound") {
            toast({
              title: "User Not Found",
              description: "User not found. Please check the phone number and try again.",
              variant: "destructive",
            })
            setIsProcessingWebhook(false); 
            return;
          }
        }

        if (!response.ok) {
          toast({
            title: "Error",
            description: `Webhook request failed with status: ${response.status}`,
            variant: "destructive",
          })
          setIsProcessingWebhook(false); 
          return;
        }

        const data = await response.json();

        if (data && data.length > 0 && data[0].Name && data[0].phoneNumber) {
          sessionStorage.setItem('userData', JSON.stringify(data[0]));
          setWelcomeUserName(data[0].Name);
          setShowWelcomeDialog(true);
        } else {
          toast({
            title: "Invalid User Data",
            description: "The user data received from the server is invalid.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error sending phone number to webhook:', error);
        toast({
          title: "Error",
          description: "Failed to connect to the server. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsProcessingWebhook(false); 
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => (prev - 1) as FormStep);
      if (typeof window !== 'undefined') {
      }
    }
  };

  const ActiveIcon = currentStep > 0 && currentStep <= MAX_STEPS ? STEP_CONFIG[currentStep]?.icon : null;
  const activeTitle = currentStep > 0 && currentStep <= MAX_STEPS ? STEP_CONFIG[currentStep]?.title : "";

  const showAppHeader = currentStep !== 0;
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
            rawApiResponse={null} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex flex-col min-h-screen")}>
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
                disabled={currentStep === 0 || isProcessingWebhook}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button onClick={nextStep} disabled={!canProceed || isProcessingWebhook}>
                {isProcessingWebhook ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
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
      <Dialog 
        open={showWelcomeDialog} 
        onOpenChange={(isOpen) => {
          setShowWelcomeDialog(isOpen);
          if (!isOpen) {
            router.push('/main-menu');
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Welcome Back!</DialogTitle>
            <DialogDescription>
              Hello {welcomeUserName}, it's great to see you again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="default">OK</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
