
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
      <CardContent className="pt-12 pb-10 flex flex-col items-center space-y-8"> {/* Increased bottom padding and spacing */}
        {/* AppHeader is now rendered globally in MultiStepForm */}
        <CardDescription className="text-center text-lg px-4"> {/* Added some horizontal padding for better text flow on small screens */}
          Please verify your identity to continue.
        </CardDescription>
        <Button
          size="lg"
          onClick={onNextStep}
          className="w-full max-w-xs text-lg py-6" // Consistent with previous styling
          aria-label="Enter Your Phone Number to start verification process"
        >
          Enter Your Phone Number
        </Button>
      </CardContent>
      {/* CardFooter removed, button moved into CardContent */}
    </Card>
  );
};

export default InitialScreen;
