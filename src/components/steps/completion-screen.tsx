import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, MapPin, ShieldAlert, AlertTriangle } from 'lucide-react';
import type { FormData, CapturedLocation } from '@/types';
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

interface UserData {
  Name: string;
  phoneNumber: string;
  SSN: string;
  birth_date: string;
  Position: string;
}

interface CompletionScreenProps {
  capturedImage: string | null;
  captureTimestamp: string | null;
  capturedLocation: CapturedLocation | null;
  userData: UserData | null;
  onRestart: () => void;
}

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);

    // Adjust for potential timezone offset
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return utcDate.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Error formatting date:", error);
    return 'Invalid Date';
  }
};

const CompletionScreen: FC<CompletionScreenProps> = ({
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
  const [isRestarting, setIsRestarting] = useState(false);

  const [isWorkAreaAlertOpen, setWorkAreaAlertOpen] = useState(false);
  const [isFaceMatchAlertOpen, setFaceMatchAlertOpen] = useState(false);
  const [faceMatchMessage, setFaceMatchMessage] = useState<string>("");

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

    try {
      const response = await fetch("https://noxtla.app.n8n.cloud/webhook-test/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          capturedImage,
          captureTimestamp,
          capturedLocation,
          userData,
          action: "capturedImage",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("Error data:", errorData);
        if (Array.isArray(errorData) && errorData.length > 0 && errorData[0].response?.body?.Failed === "Face does not match profile") {
            const personName = errorData[0].response.body["Person is"];
            console.log("Person name:", personName);
            setFaceMatchMessage(`Face does not match profile. You are: ${personName}`);
            setFaceMatchAlertOpen(true);
            console.log("isFaceMatchAlertOpen:", isFaceMatchAlertOpen);
            return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSubmissionResponse(JSON.stringify(result));
      setSubmissionState('submitted');
      toast({
        variant: "success",
        title: "Attendance Recorded",
        description: "Your attendance has been successfully recorded.",
      });
    } catch (error: any) {
      console.error("Submission error:", error);
      setSubmissionResponse(`Submission failed: ${error.message}`);
      setSubmissionState('reviewing');
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "Failed to record attendance. Please try again.",
      });
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('attendanceSubmitted', 'true');
    }
  };

  const handleActualRestart = async () => {
    setIsRestarting(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('currentTruckNumber'); 
    }
    onRestart();
  };

  return (
    <>
      <Card className="w-full border-none shadow-none">
        {submissionState === 'submitted' ? (
          <>
            <CardHeader className="items-center pt-6 animate-step-enter">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <CardTitle className="text-xl sm:text-2xl text-center">Attendance Recorded!</CardTitle>
              <CardDescription className="text-center text-base px-2">
                We hope you have a successful and safe day. Thank you for working for Tree Services.
              </CardDescription>
            </CardHeader>
            {submissionResponse && (
              <CardContent className="pt-4">
                <div className="mt-4 p-3 bg-muted rounded-md w-full overflow-x-auto">
                  <h4 className="text-sm font-semibold mb-1 text-muted-foreground">Simulated Response:</h4>
                  <pre className="text-xs whitespace-pre-wrap break-all bg-background p-2 rounded border text-foreground">
                    {submissionResponse}
                  </pre>
                </div>
              </CardContent>
            )}
            <CardFooter className="flex justify-center pt-6">
              <Button onClick={handleActualRestart} size="lg" aria-label="Done" disabled={isRestarting}>
                {isRestarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isRestarting ? "Loading..." : "Done"}
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
                  {userData && <li>Phone: {userData.phoneNumber}</li>}
                  {userData && <li>SSN (Last 4): ••••{userData.SSN ? userData.SSN.slice(-4) : '****'}</li>}
                  {userData && <li>Birth Date: {userData.birth_date ? formatDate(userData.birth_date) : 'N/A'}</li>}
                  {userData && <li>Position: {userData.Position}</li>}
                </ul>
              </div>

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

      <AlertDialog open={isFaceMatchAlertOpen} onOpenChange={setFaceMatchAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <ShieldAlert className="h-10 w-10 text-red-600 mb-2" />
            <AlertDialogTitle>Verification Failed</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center">
            {faceMatchMessage || "Face does not match profile. Attempting to impersonate another individual is a serious offense and will result in immediate termination and potential legal action."}
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
