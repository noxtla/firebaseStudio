
"use client";

import { useState, type ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { FormData, FormStep, UserData } from '@/types'; // Removed CapturedLocation as it's not used here
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
import { Phone, ArrowLeft, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
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
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isProcessingPhoneNumber, setIsProcessingPhoneNumber] = useState(false);
  const [isLoadingPhoneNumber, setIsLoadingPhoneNumber] = useState(false);

  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successDialogTitle, setSuccessDialogTitle] = useState("");
  const [successDialogMessage, setSuccessDialogMessage] = useState("");


  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (currentStep === 0) {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('loginWebhookStatus');
        sessionStorage.removeItem('rawApiResponse');
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
    setIsProcessingPhoneNumber(false);
    setIsSuccessDialogOpen(false);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('userData');
      sessionStorage.removeItem('loginWebhookStatus');
      sessionStorage.removeItem('rawApiResponse');
      sessionStorage.removeItem('currentTruckNumber');
      sessionStorage.removeItem('attendanceSubmitted');
    }
  };

  const handleSuccessDialogCloseAndNavigate = () => {
    setIsSuccessDialogOpen(false);
    router.push('/main-menu');
  };

  const nextStep = async () => {
    setRawApiResponse(null);

    if (currentStep === 0) {
      setCurrentStep(1);
      return;
    }

    if (currentStep === 1 && canProceed) {
      setIsProcessingPhoneNumber(true);
      setUserData(null);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('userData');
        sessionStorage.removeItem('loginWebhookStatus');
        sessionStorage.removeItem('attendanceSubmitted');
      }
      
      await new Promise(resolve => setTimeout(resolve, 500));

      const cleanedPhoneNumber = formData.phoneNumber.replace(/\D/g, '');
      const mockUserData: UserData = {
        Name: "Mock User",
        Puesto: "Mock Position",
        phoneNumber: cleanedPhoneNumber,
        NSS: "1234",
        dataBirth: "1990-01-15",
        Vehicles: ["111-1111", "222-2222", "123-4567"],
      };

      const webhookUrl = process.env.NEXT_PUBLIC_LOGIN_WEBHOOK_URL;

      if (!webhookUrl) {
        console.error("Webhook URL is not defined in environment variables.");
        toast({
          variant: "destructive",
          title: "Configuration Error",
          description: "Webhook URL is not defined. Please configure the environment variable.",
        });
        return;
      }

      try {
        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phoneNumber: cleanedPhoneNumber }),
        });

        const responseStatus = response.status;
        const responseText = await response.text();
        let parsedData = null;
        try {
          parsedData = JSON.parse(responseText);
        } catch (parseError) {
          console.error("JSON Parse Error:", parseError, "Raw Response:", responseText);
        }
        setRawApiResponse(responseText); 
        if (typeof window !== 'undefined') sessionStorage.setItem('rawApiResponse', responseText);

        if (response.ok) { // Status 200-299
          if (responseText) {
            try {
              // Case: User explicitly does not exist as per webhook logic
              if (typeof parsedData === 'object' && parsedData !== null && 'myField' in parsedData && parsedData.myField === "NO EXISTE") {
                toast({ variant: "destructive", title: "User Not Found", description: "User not found. Please check the phone number and try again." });
              } 
              // Case: User data found and is in the expected array format
              else if (Array.isArray(parsedData) && parsedData.length > 0 && parsedData[0].Name) {
                const fetchedUserData: UserData = { ...parsedData[0], phoneNumber: cleanedPhoneNumber };
                setUserData(fetchedUserData);
                if (typeof window !== 'undefined') {
                  sessionStorage.setItem('userData', JSON.stringify(fetchedUserData));
                  sessionStorage.setItem('loginWebhookStatus', responseStatus.toString());
                }
                toast({ variant: "success", title: "Success", description: "Phone number verified. Redirecting..." });
                router.push('/main-menu');
              } 
              // Case: Response OK, but not "NO EXISTE" and not valid user data array
              else {
                toast({ variant: "destructive", title: "User Data Error", description: "User data not found or invalid data received from server." });
              }
            } catch (jsonError) { // JSON.parse failed
              console.error("JSON Parse Error:", jsonError, "Raw Response:", responseText);
              toast({ variant: "destructive", title: "Response Format Error", description: `Received an invalid response format from the server. Response: ${responseText}.` });
            }
          } else { // Response OK, but empty responseText
            toast({ variant: "destructive", title: "Empty Success Response", description: `Server responded with status ${responseStatus} but no content.` });
          }
        } else if (responseStatus === 404) {
          setIsNotFoundAlertOpen(true);
        } else if (responseStatus === 503) {
          if (typeof window !== 'undefined') {
            sessionStorage.removeItem('userData'); 
            sessionStorage.setItem('loginWebhookStatus', responseStatus.toString());
          }
          toast({ variant: "default", title: "Service Unavailable", description: "Service temporarily unavailable. Proceeding to the main menu, some features may be limited."});
          router.push('/main-menu');
        } else { // Other non-ok HTTP statuses
          toast({ variant: "destructive", title: "Verification Error", description: `Failed to verify phone number. Status: ${responseStatus}. ${responseText ? `Details: ${responseText}` : 'No details in response.'}` });
        }
      } catch (error: any) { // Network error or other fetch-related issues
        let userFriendlyMessage = `Network Error: Could not connect to the verification service at ${webhookUrl}. This might be due to the server not running, a network issue, or a CORS policy. Please check that the server is accessible and properly configured for CORS. Check your browser's developer console for more details.`;
        if (error instanceof Error && error.message) {
          if (error.message.toLowerCase().includes('failed to fetch')) {
             userFriendlyMessage = `Network Error: Failed to connect to the server at ${webhookUrl}. This might be due to the server not running, a network issue, or a CORS policy. Please check the server status, CORS configuration, and your browser's developer console.`;
          } else {
            userFriendlyMessage = `Network Error: ${error.message}. This might be due to an issue with the server at ${webhookUrl}, your internet connection, or a CORS policy. Please check the server status and your browser's developer console.`;
          }
        }
        console.error("Phone Verification Fetch Error:", error);
        setRawApiResponse(error.message || "Fetch failed");
        if (typeof window !== 'undefined') sessionStorage.setItem('rawApiResponse', error.message || "Fetch failed");

        toast({
          variant: "destructive",
          title: "Network Error",
          description: userFriendlyMessage,
        });
      } finally {
        setIsLoadingPhoneNumber(false);
      }

      setUserData(mockUserData);
      setIsProcessingPhoneNumber(false);

      setSuccessDialogTitle("Login Successful");
      setSuccessDialogMessage(`Welcome, ${mockUserData.Name}! You will now be redirected to the main menu.`);
      setIsSuccessDialogOpen(true);
      // Navigation will happen when "OK" is clicked in the dialog
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
    <div className={cn("flex flex-col min-h-screen")}>
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

      <AlertDialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <CheckCircle className="h-12 w-12 text-green-500 mb-2" />
            <AlertDialogTitle>{successDialogTitle}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center">
            {successDialogMessage}
          </AlertDialogDescription>
          <AlertDialogFooter className="flex justify-center sm:justify-center pt-4">
            <AlertDialogAction 
              onClick={handleSuccessDialogCloseAndNavigate}
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              OK
            </AlertDialogAction>
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
                disabled={currentStep === 0 || isProcessingPhoneNumber}
              >
                <ArrowLeft className="mr-2 h-4 w-4" /> Previous
              </Button>
              <Button onClick={nextStep} disabled={!canProceed || isProcessingPhoneNumber}>
                {isProcessingPhoneNumber ? (
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
    </div>
  );
}
