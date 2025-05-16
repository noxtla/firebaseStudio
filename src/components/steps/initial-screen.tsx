
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription } from '@/components/ui/card';

interface InitialScreenProps {
  onNextStep: () => void;
}

const InitialScreen: FC<InitialScreenProps> = ({ onNextStep }) => {
  return (
    <Card className="w-full shadow-xl">
      <CardContent className="pt-10 pb-8 flex flex-col items-center space-y-6"> {/* Adjusted padding and spacing */}
        {/* AppHeader is now rendered globally in MultiStepForm */}
        <CardDescription className="text-center text-lg px-4">
          Please verify your identity to continue.
        </CardDescription>
        <Button
          size="lg"
          onClick={onNextStep}
          className="w-full max-w-xs text-lg py-6 whitespace-normal h-auto" // Allow text wrapping and adjust height
          aria-label="Enter Your Phone Number to start verification process"
        >
          Enter Your Phone Number
        </Button>
      </CardContent>
    </Card>
  );
};

export default InitialScreen;
