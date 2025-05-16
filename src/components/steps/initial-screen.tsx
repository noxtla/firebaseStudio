
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppHeader from '../app-header';

interface InitialScreenProps {
  onNextStep: () => void;
}

const InitialScreen: FC<InitialScreenProps> = ({ onNextStep }) => {
  return (
    // This outer div ensures the Card is centered on the screen and the background is white.
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-card px-4">
      <Card className="w-full max-w-md border-none shadow-none">
        {/* Use CardContent as a flex container for AppHeader and Button */}
        {/* p-8 for padding on smaller screens, p-12 on medium screens and up for more generous spacing */}
        <CardContent className="flex flex-col items-center justify-center p-8 md:p-12">
          {/* mb-8 for medium spacing (2rem), md:mb-10 for slightly more on larger screens (2.5rem) */}
          <AppHeader className="mb-8 md:mb-10" />
          <Button
            size="lg"
            onClick={onNextStep}
            className="w-full max-w-xs text-lg py-6 whitespace-normal h-auto"
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
