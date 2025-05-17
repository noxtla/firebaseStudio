
"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppHeader from '../app-header';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InitialScreenProps {
  onNextStep: () => void;
}

const InitialScreen: FC<InitialScreenProps> = ({ onNextStep }) => {
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    setIsLoadingStatus(true);
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    // Check if current time is between 7:00 AM and 7:15 AM
    if (currentHour === 7 && currentMinutes >= 0 && currentMinutes <= 15) {
      setIsButtonEnabled(true);
    } else {
      setIsButtonEnabled(false);
    }
    setIsLoadingStatus(false);
  }, []);

  const isDisabled = !isButtonEnabled || isLoadingStatus;

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-card px-4">
      <Card className="w-full max-w-md border-none shadow-none bg-card">
        <CardContent className="flex flex-col items-center justify-between p-6 md:p-8 min-h-[50vh] sm:min-h-[45vh]">
          <AppHeader />
          <div className="w-full flex flex-col items-center gap-y-12">
            <Button
              size="lg"
              onClick={onNextStep}
              className={cn(
                "w-full max-w-xs text-lg py-6 whitespace-nowrap",
                !isDisabled && "animate-soft-pulse",
                "disabled:bg-primary disabled:text-primary-foreground disabled:opacity-60"
              )}
              aria-label="Enter Your Phone Number to start verification process"
              disabled={isDisabled}
            >
              {isLoadingStatus ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Checking Access...
                </>
              ) : (
                'Enter Your Phone Number'
              )}
            </Button>
            {!isLoadingStatus && !isButtonEnabled && (
              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  Access is currently disabled.
                </p>
                <p className="text-xs text-muted-foreground/90 mt-1">
                  The registration is only 7:00 am - 7:15 am.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialScreen;
