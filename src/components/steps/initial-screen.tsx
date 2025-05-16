"use client";

import type { FC } from 'react';
import AnimatedLogo from '@/components/animated-logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface InitialScreenProps {
  onNextStep: () => void;
}

const InitialScreen: FC<InitialScreenProps> = ({ onNextStep }) => {
  return (
    <Card className="w-full shadow-xl">
      <CardContent className="pt-10 pb-8 flex flex-col items-center space-y-8">
        <AnimatedLogo />
      </CardContent>
      <CardFooter className="flex justify-center pb-8">
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
