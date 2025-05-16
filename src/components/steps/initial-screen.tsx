
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
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-card px-4">
      <Card className="w-full max-w-md border-none shadow-none bg-card">
        <CardContent className="flex flex-col items-center justify-center p-6 md:p-8 gap-y-20"> {/* Increased gap from gap-y-12 to gap-y-20 */}
          <AppHeader />
          <Button
            size="lg"
            onClick={onNextStep}
            className="w-full max-w-xs text-lg py-6 whitespace-nowrap animate-soft-pulse"
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

