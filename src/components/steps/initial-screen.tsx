
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Added CardHeader
import AppHeader from '../app-header';

interface InitialScreenProps {
  onNextStep: () => void;
}

const InitialScreen: FC<InitialScreenProps> = ({ onNextStep }) => {
  return (
    // Removed bg-card from this div to allow body gradient to show
    // Main container centers content vertically and horizontally
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4">
      <Card className="w-full max-w-md border-none shadow-none bg-card"> {/* Card itself remains white */}
        <CardHeader className="pt-8 pb-4 md:pt-12 md:pb-6"> {/* Adjusted padding */}
          <AppHeader />
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 md:p-8"> {/* Adjusted padding */}
          <Button
            size="lg"
            onClick={onNextStep}
            className="w-full max-w-xs text-lg py-6 whitespace-normal h-auto mt-4" // Added margin top
            aria-label="Enter Your Phone Number to start verification process"
          >
            Enter Your Phone Number
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialScreen;
