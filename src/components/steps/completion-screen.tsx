"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import type { FormData } from '@/types';
import Image from 'next/image';

interface CompletionScreenProps {
  formData: FormData;
  capturedImage: string | null;
  onRestart: () => void;
}

const CompletionScreen: FC<CompletionScreenProps> = ({ formData, capturedImage, onRestart }) => {
  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="items-center">
        <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
        <CardTitle className="text-2xl text-center">Verification Complete!</CardTitle>
        <CardDescription className="text-center">
          Thank you. Your information has been submitted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2 text-lg">Summary:</h3>
          <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
            <li>Phone: {formData.phoneNumber}</li>
            <li>SSN (Last 4): ****{formData.ssnLast4.slice(-4)}</li> {/* Mask for display */}
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
        <Button onClick={onRestart} size="lg" aria-label="Start new verification">
          Start Over
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CompletionScreen;
