
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import type { FormData, UserData } from '@/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface CompletionScreenProps {
  formData: FormData;
  capturedImage: string | null;
  userData: UserData | null;
  onRestart: () => void;
}

const getMonthNameFromDate = (dateString: string): string => {
  try {
    const [_, monthNumStr] = dateString.split('-');
    const monthNum = parseInt(monthNumStr, 10);
    const date = new Date();
    date.setMonth(monthNum - 1);
    return date.toLocaleString('en-US', { month: 'long' });
  } catch {
    return "September"; // Fallback
  }
};

const getYearFromDate = (dateString: string): string => {
  try {
    const [yearStr] = dateString.split('-');
    return yearStr;
  } catch {
    return "1996"; // Fallback
  }
};


const CompletionScreen: FC<CompletionScreenProps> = ({ formData, capturedImage, userData, onRestart }) => {
  const [submissionState, setSubmissionState] = useState<'reviewing' | 'submitting' | 'submitted'>('reviewing');
  const { toast } = useToast();

  const handleSubmit = async () => {
    setSubmissionState('submitting');

    const payload = {
      step: "finalSubmission", // Flag for N8N
      userInput: {
        phoneNumber: formData.phoneNumber,
        ssnLast4: formData.ssnLast4,
        birthDay: formData.birthDay,
      },
      verifiedUserData: userData,
      capturedImageBase64: capturedImage,
      submissionTimestamp: new Date().toISOString(),
    };

    try {
      const response = await fetch('https://n8n.srv809556.hstgr.cloud/webhook-test/v1', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // const responseData = await response.json(); // Or response.text() if N8N returns simple status
        // console.log('Submission successful:', responseData);
        setSubmissionState('submitted');
        toast({
          title: "Submission Successful",
          description: "Your information has been sent.",
        });
      } else {
        // const errorData = await response.text();
        // console.error('Submission failed:', response.status, errorData);
        toast({
          variant: "destructive",
          title: "Submission Error",
          description: `Failed to submit data. Status: ${response.status}`,
        });
        setSubmissionState('reviewing'); // Allow user to try again
      }
    } catch (error) {
      // console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Submission Error",
        description: "An error occurred while submitting your information. Please try again.",
      });
      setSubmissionState('reviewing'); // Allow user to try again
    }
  };

  const handleStartOver = () => {
    setSubmissionState('reviewing');
    onRestart();
  };

  const displayMonth = userData?.dataBirth ? getMonthNameFromDate(userData.dataBirth) : "September";
  const displayYear = userData?.dataBirth ? getYearFromDate(userData.dataBirth) : "1996";
  const birthDayDisplay = `${formData.birthDay} ${displayMonth} ${displayYear}`;

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
          <CardFooter className="flex justify-center pt-6">
            <Button onClick={handleStartOver} size="lg" aria-label="Start new verification">
              Start Over
            </Button>
          </CardFooter>
        </>
      ) : (
        <>
          <CardHeader className="items-center pt-6">
            <CardTitle className="text-xl sm:text-2xl text-center">Review Your Information</CardTitle>
            <CardDescription className="text-center pt-2">
              Please review your details below before submitting.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div>
              <h3 className="font-semibold mb-2 text-lg">Summary:</h3>
              <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                <li>Phone: {formData.phoneNumber}</li>
                <li>SSN (Last 4): ••••{formData.ssnLast4.slice(-4)}</li>
                <li>Birth Day: {birthDayDisplay}</li>
                {userData && (
                  <>
                    <li>Name: {userData.Name}</li>
                    <li>Position: {userData.Puesto}</li>
                  </>
                )}
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
              disabled={submissionState === 'submitting'}
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
