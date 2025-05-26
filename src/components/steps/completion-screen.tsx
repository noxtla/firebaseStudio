
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, MapPin, ShieldAlert, AlertTriangle } from 'lucide-react';
import type { FormData, UserData, CapturedLocation } from '@/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
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
  return nameStr
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
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

  const [isWorkAreaAlertOpen, setWorkAreaAlertOpen] = useState(false);
  const [isFaceMatchAlertOpen, setFaceMatchAlertOpen] = useState(false);
  // alertMessage state removed as specific dialogs handle messages

  useEffect(() => {
    setIsMounted(true);
  }, []);


  const handleSubmit = async () => {
    setSubmissionState('submitting');
    setSubmissionResponse(null);
    // alertMessage removed
    setWorkAreaAlertOpen(false);
    setFaceMatchAlertOpen(false);

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
        try {
          const parsedData = JSON.parse(responseText);
          if (parsedData.Success === "Attendance recorded") {
            setSubmissionState('submitted');
          } else {
            setSubmissionState('reviewing');
            toast({
              variant: "destructive",
              title: "Unexpected Response",
              description: `Submission was successful, but the server response was not as expected: ${responseText}. Please contact support.`,
            });
          }
        } catch (e) {
          setSubmissionState('reviewing');
          toast({
            variant: "destructive",
            title: "Response Error",
            description: `Submission was successful (HTTP ${response.status}), but the response format was invalid: ${responseText}. Please contact support.`,
          });
        }
      } else { // response not ok (4xx, 5xx)
        setSubmissionState('reviewing');
        let errorHandledByDialog = false;
        try {
          const parsedErrorData = JSON.parse(responseText);
          if (parsedErrorData.Failed === "Outside designated work area") {
            setWorkAreaAlertOpen(true);
            errorHandledByDialog = true;
          } else if (parsedErrorData.Failed === "Face does not match profile") {
            setFaceMatchAlertOpen(true);
            errorHandledByDialog = true;
          }
        } catch (e) {
          // JSON parsing of error failed, will be handled by generic toast + redirect below
        }

        if (!errorHandledByDialog) {
          toast({
            variant: "destructive",
            title: "Submission Error",
            description: `Failed to submit data. Status: ${response.status}. Server response: ${responseText}`,
          });
          onRestart(); // Navigate to main menu
        }
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : "An unknown network error occurred. Please check your internet connection and try again.";
      setSubmissionResponse(errorMessage);
      setSubmissionState('reviewing');
      toast({
        variant: "destructive",
        title: "Submission Network Error",
        description: `Could not submit your information. Error: ${errorMessage}. This might be due to a network issue or a problem with the server. Please check your connection and try again.`,
      });
      onRestart(); // Navigate to main menu
    }
  };

  const birthDayDisplay = userData?.dataBirth && formData.birthDay
    ? `${formData.birthDay} ${getMonthNameFromDate(userData.dataBirth)} ${getYearFromDate(userData.dataBirth)}`
    : `${formData.birthDay || 'N/A'}`;


  return (
    <>
      <Card className="w-full border-none shadow-none">
        {submissionState === 'submitted' ? (
          <>
            <CardHeader className="items-center pt-6 animate-step-enter">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <CardTitle className="text-xl sm:text-2xl text-center">Attendance Recorded!</CardTitle>
              <CardDescription className="text-center text-base px-2">
                We hope you have a successful and safe day. Thank you for working for Asplundh.
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
                  isMounted && submissionState === 'reviewing' && "animate-title-pulse"
                )}
              >
                {submissionState === 'submitting' ? 'Processing...' : 'Send Your Information'}
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
                  <h4 className="text-sm font-semibold mb-1 text-destructive">Last Webhook Submission Response/Error:</h4>
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
                    Please wait, validating data...
                  </>
                ) : (
                  'Submit'
                )}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>

      {/* Work Area Alert Dialog */}
      <AlertDialog open={isWorkAreaAlertOpen} onOpenChange={setWorkAreaAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
             <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
            <AlertDialogTitle>Submission Issue</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center">
            You appear to be outside the designated work area. Please move to an authorized location and try again.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setWorkAreaAlertOpen(false); onRestart(); }}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Face Match Alert Dialog */}
      <AlertDialog open={isFaceMatchAlertOpen} onOpenChange={setFaceMatchAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <ShieldAlert className="h-10 w-10 text-red-600 mb-2" />
            <AlertDialogTitle>Verification Failed</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center">
            Face does not match profile. Attempting to impersonate another individual is a serious offense and will result in immediate termination and potential legal action.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setFaceMatchAlertOpen(false); onRestart(); }}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CompletionScreen;

    