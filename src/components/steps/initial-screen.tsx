
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
  const [isButtonEnabledByApi, setIsButtonEnabledByApi] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  useEffect(() => {
    const fetchButtonStatus = async () => {
      setIsLoadingStatus(true);
      try {
        const response = await fetch('/api/button-control');
        if (response.ok) {
          const data = await response.json();
          setIsButtonEnabledByApi(data.isEnabled);
        } else {
          console.error('Failed to fetch button status from API:', response.statusText);
          setIsButtonEnabledByApi(false); // Keep disabled on error
        }
      } catch (error) {
        console.error('Error fetching button status:', error);
        setIsButtonEnabledByApi(false); // Keep disabled on error
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchButtonStatus();
    // Optional: Set up polling if you need more real-time updates without user interaction.
    // const intervalId = setInterval(fetchButtonStatus, 30000); // e.g., check every 30 seconds
    // return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, []);

  const isDisabled = !isButtonEnabledByApi || isLoadingStatus;

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
                !isDisabled && "animate-soft-pulse", // Apply animation only when enabled
                // Custom disabled styles:
                "disabled:bg-zinc-600 disabled:text-zinc-400 disabled:opacity-100" 
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
            {!isLoadingStatus && !isButtonEnabledByApi && (
              <p className="text-sm text-muted-foreground mt-2 text-center">
                Access is currently disabled. Please try again later or contact support.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default InitialScreen;
