
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react'; 
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, MapPin } from 'lucide-react';
import type { FormData, UserData, CapturedLocation } from '@/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface CompletionScreenProps {
  formData: Pick<FormData, 'phoneNumber' | 'ssnLast4' | 'birthDay'>;
  capturedImage: string | null;
  captureTimestamp: string | null;
  capturedLocation: CapturedLocation | null;
  userData: UserData | null; 
  onRestart: () => void;
}

const getMonthNameFromDate = (dateString: string | undefined): string => {
  if (!dateString) return "Month";
  try {
    const [_, monthNumStr] = dateString.split('-');
    const monthNum = parseInt(monthNumStr, 10);
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  } catch {
    return "Month";
  }
};

const getYearFromDate = (dateString: string | undefined): string => {
  if (!dateString) return "Year";
  try {
    const [yearStr] = dateString.split('-');
    return yearStr;
  } catch {
    return "Year";
  }
};

const transformNameForPayload = (nameStr: string | undefined): string => {
  if (!nameStr) return '';
  // Capitalize first letter of each word, rest lowercase, join with hyphen
  return nameStr
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('-');
};


const CompletionScreen: FC<CompletionScreenProps> = ({
  formData,
  capturedImage,
  captureTimestamp,
  capturedLocation,
  userData,
  onRestart
}) => {
  const [submissionState, setSubmissionState] = useState<'reviewing' | 'submitting' | 'submitted'>('reviewing');
  const [submissionResponse, setSubmissionResponse] = useState<string | null>(null);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true); 
  }, []);


  const handleSubmit = async () => {
    setSubmissionState('submitting');
    setSubmissionResponse(null);

    if (!capturedImage) {
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "No image captured. Please go back and take a photo.",
      });
      setSubmissionState('reviewing');
      return;
    }

    let locationInfoPayload: any = "Precise location not available or permission denied.";
    if (capturedLocation) {
      locationInfoPayload = {
        latitude: capturedLocation.latitude,
        longitude: capturedLocation.longitude,
        accuracy: capturedLocation.accuracy,
        geolocationTimestamp: new Date(capturedLocation.timestamp).toISOString(),
      };
    }

    const payload: any = {
      step: "finalSubmission",
      name: userData?.Name ? transformNameForPayload(userData.Name) : '',
      phoneNumber: formData.phoneNumber || (userData?.phoneNumber || ''),
      ssnLast4: formData.ssnLast4 || '',
      birthDay: formData.birthDay || '',
      capturedImageBase64: capturedImage,
      metadata: {
        captureTimestamp: captureTimestamp || new Date().toISOString(),
        locationInfo: locationInfoPayload,
      }
    };
    
    // Use the correct webhook URL based on where CompletionScreen is used
    // Defaulting to /photo for attendance, but could be made dynamic if needed elsewhere
    const webhookUrl = 'https://n8n.srv809556.hstgr.cloud/webhook-test/photo';


    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseText = await response.text();
      setSubmissionResponse(responseText); 

      if (response.ok) {
        setSubmissionState('submitted');
        toast({
          variant: "success",
          title: "Submission Successful",
          description: "Your information has been sent.",
        });
      } else {
        console.error('Submission failed:', response.status, responseText);
        toast({
          variant: "destructive",
          title: "Submission Error",
          description: `Failed to submit data. Status: ${response.status}. ${responseText ? `Details: ${responseText}` : ''}`,
        });
        setSubmissionState('reviewing'); 
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown network error occurred. Please check your internet connection and try again.";
      setSubmissionResponse(errorMessage); 
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: `Could not submit your information. Error: ${errorMessage}. This might be due to a network issue or a problem with the server. Please check your connection and try again.`,
      });
      setSubmissionState('reviewing');
    }
  };

  const birthDayDisplay = userData?.dataBirth && formData.birthDay
    ? `${formData.birthDay} ${getMonthNameFromDate(userData.dataBirth)} ${getYearFromDate(userData.dataBirth)}`
    : `${formData.birthDay || 'N/A'}`;


  return (
    <Card className="w-full border-none shadow-none">
      {submissionState === 'submitted' ? (
        <>
          <CardHeader className="items-center pt-6 animate-step-enter">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <CardTitle className="text-xl sm:text-2xl text-center">Submission Successful!</CardTitle>
            <CardDescription className="text-center">
              Your information has been submitted successfully.
            </CardDescription>
          </CardHeader>
          {submissionResponse && (
            <CardContent className="pt-4">
              <div className="mt-4 p-3 bg-muted rounded-md w-full overflow-x-auto">
                <h4 className="text-sm font-semibold mb-1 text-muted-foreground">Webhook Response:</h4>
                <pre className="text-xs whitespace-pre-wrap break-all bg-background p-2 rounded border text-foreground">
                  {submissionResponse}
                </pre>
              </div>
            </CardContent>
          )}
          <CardFooter className="flex justify-center pt-6">
             <Button onClick={onRestart} size="lg" aria-label="Done">
              Done
            </Button>
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader className="items-center pt-6">
            <CardTitle
              className={cn(
                "text-xl sm:text-2xl text-center font-heading-style",
                 isMounted && "animate-title-pulse" 
              )}
            >
              Send Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <h3 className="font-semibold text-lg mb-2">Summary:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                {userData && <li>Name: {userData.Name}</li>}
                <li>Phone: {formData.phoneNumber || (userData?.phoneNumber || '')}</li>
                <li>SSN (Last 4): ••••{formData.ssnLast4 ? formData.ssnLast4.slice(-4) : '****'}</li>
                <li>Birth Day: {birthDayDisplay}</li>
                {userData && <li>Position: {userData.Puesto}</li> }
              </ul>
            </div>
            {capturedImage && (
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Captured Photo:</h3>
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden border">
                  <Image
                    src={capturedImage}
                    alt="Captured verification photo"
                    layout="fill"
                    objectFit="contain"
                    data-ai-hint="person face"
                    className="transform scale-x-[-1]"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Capture Details:</h3>
              {captureTimestamp && (
                <p className="text-sm text-muted-foreground">Photo captured on: {new Date(captureTimestamp).toLocaleString()}</p>
              )}
              {capturedLocation ? (
                <p className="text-sm text-muted-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-1 text-primary" />
                  Location: Lat {capturedLocation.latitude.toFixed(4)}, Lon {capturedLocation.longitude.toFixed(4)} (Accuracy: {capturedLocation.accuracy.toFixed(0)}m)
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Location data: Not available or permission denied.</p>
              )}
            </div>
            {submissionState === 'reviewing' && submissionResponse && ( 
               <div className="mt-4 p-3 bg-destructive/10 rounded-md border border-destructive/30 w-full overflow-x-auto">
                <h4 className="text-sm font-semibold mb-1 text-destructive">Webhook Submission Response/Error:</h4>
                <pre className="text-xs whitespace-pre-wrap break-all text-destructive/80 p-2 rounded">
                  {submissionResponse}
                </pre>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button
              onClick={handleSubmit}
              size="lg"
              aria-label="Submit information"
              disabled={submissionState === 'submitting' || !capturedImage}
              className={cn(
                "bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-500",
              )}
            >
              {submissionState === 'submitting' ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit'
              )}
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  );
};

export default CompletionScreen;
    