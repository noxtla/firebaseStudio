
"use client";

import type { FC } from 'react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2 } from 'lucide-react';
import type { FormData } from '@/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CompletionScreenProps {
  formData: FormData;
  capturedImage: string | null;
  onRestart: () => void;
}

const CompletionScreen: FC<CompletionScreenProps> = ({ formData, capturedImage, onRestart }) => {
  const [submissionState, setSubmissionState] = useState<'reviewing' | 'submitting' | 'submitted'>('reviewing');

  const handleSubmit = async () => {
    setSubmissionState('submitting');
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setSubmissionState('submitted');
  };

  const handleStartOver = () => {
    setSubmissionState('reviewing'); // Reset state for this component
    onRestart(); // Call original restart logic from MultiStepForm
  };

  return (
    <Card className="w-full border-none shadow-none">
      {submissionState === 'submitted' ? (
        <>
          <CardHeader className="items-center pt-6 animate-step-enter">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <CardTitle className="text-2xl text-center">Submission Successful!</CardTitle>
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
            <CardTitle className="text-2xl text-center">Review Your Information</CardTitle>
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
                <li>Birth Day: {formData.birthDay}</li>
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
                 // submissionState === 'submitting' ? "bg-green-400" : "bg-green-600 hover:bg-green-700"
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
