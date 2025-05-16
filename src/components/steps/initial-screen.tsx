
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card'; // Card is not directly used for visuals but AppHeader is
import AppHeader from '../app-header';

interface InitialScreenProps {
  onNextStep: () => void;
}

const InitialScreen: FC<InitialScreenProps> = ({ onNextStep }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center bg-card px-4">
      {/* This inner div takes up the flexible space and uses max-w-md for content centering */}
      <div className="w-full max-w-md flex-1 flex flex-col">
        {/* Section for AppHeader, aiming for 1/3 down */}
        {/* Adjust vh for desired positioning; 30vh means header content centered within top 30% of screen height */}
        <div className="h-[33vh] flex items-center justify-center">
          <AppHeader />
        </div>

        {/* Section for Button, aiming for 2/3 down */}
        {/* flex-1 takes remaining space, items-center centers button within that */}
        <div className="flex-1 flex items-center justify-center">
          <Button
            size="lg"
            onClick={onNextStep}
            className="w-full max-w-xs text-lg py-6 whitespace-normal h-auto"
            aria-label="Enter Your Phone Number to start verification process"
          >
            Enter Your Phone Number
          </Button>
        </div>
        {/* Small spacer at the bottom to ensure button isn't flush against absolute bottom if screen is very short */}
        <div className="h-[5vh]"></div>
      </div>
    </div>
  );
};

export default InitialScreen;
