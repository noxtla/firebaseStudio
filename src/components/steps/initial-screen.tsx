
"use client";

import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import AppHeader from '../app-header';

interface InitialScreenProps {
  onNextStep: () => void;
}

const InitialScreen: FC<InitialScreenProps> = ({ onNextStep }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-card p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="items-center pt-10 pb-6">
          <AppHeader />
        </CardHeader>
        <CardContent className="pb-10 flex flex-col items-center">
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
