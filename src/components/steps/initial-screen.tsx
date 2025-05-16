
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Added CardHeader
import AppHeader from '../app-header'; // Import AppHeader

interface InitialScreenProps {
  onNextStep: () => void;
}

const InitialScreen: FC<InitialScreenProps> = ({ onNextStep }) => {
  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="items-center pt-10 pb-6"> {/* Centering and padding for the header */}
        <AppHeader /> {/* AppHeader is now inside the Card for the initial screen */}
      </CardHeader>
      <CardContent className="pb-10 flex flex-col items-center"> {/* Adjusted padding for the button */}
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
