"use client";

import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import AppHeader from '../app-header';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog'; // Import Dialog components

interface InitialScreenProps {
  onNextStep: () => void;
}

const InitialScreen: FC<InitialScreenProps> = ({ onNextStep }) => {
  const [isButtonEnabled, setIsButtonEnabled] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false); // State for dialog visibility

  const isDisabled = isLoadingStatus || !isButtonEnabled;

  const handleButtonClick = () => {
    setIsDialogOpen(true); // Open the dialog
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open); // Update dialog state
    if (!open) {
      // If dialog is closing, proceed to the next step
      onNextStep();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-card px-4">
      <Card className="w-full max-w-md border-none shadow-none bg-card">
        <CardContent className="flex flex-col items-center justify-center gap-y-12 p-6 md:p-8"> {/* Changed justify-between to justify-center, removed min-h, added gap-y-12 */}
          <AppHeader />

          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}> {/* Control dialog with state */}
            <Button
              size="lg"
              onClick={handleButtonClick} // Open dialog on button click
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

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Important Warning</DialogTitle>
                <DialogDescription>
                  Warning: Impersonating another individual or attempting fraudulent activities is a serious offense and will result in immediate termination and potential legal action.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="default">OK</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 
            The message below is intentionally kept as per previous request,
            even when the button is enabled.
          */}
          {/* Removed the old static warning text div */}
           <div className="mt-4 text-center">
            <p className="text-sm font-medium text-muted-foreground">
              For currently active employees only.
            </p>
            <p className="text-xs text-muted-foreground/90 mt-1">
              Any fraudulent activity will be penalized.
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default InitialScreen;
