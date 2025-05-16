
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardDescription } from '@/components/ui/card'; // Added CardDescription

interface InitialScreenProps {
  onNextStep: () => void;
}

const InitialScreen: FC<InitialScreenProps> = ({ onNextStep }) => {
  return (
    <Card className="w-full shadow-xl">
      <CardContent className="pt-12 pb-8 flex flex-col items-center space-y-6">
        {/* AppHeader is now rendered globally in MultiStepForm */}
        <CardDescription className="text-center text-lg">
          Please verify your identity to continue.
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-center pb-10">
        <Button 
          size="lg" 
          onClick={onNextStep} 
          className="w-full max-w-xs text-lg py-6"
          aria-label="Enter Your Phone Number to start verification process"
        >
          Enter Your Phone Number
        </Button>
      </CardFooter>
    </Card>
  );
};

export default InitialScreen;
