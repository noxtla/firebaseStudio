"use client";

import type { FC } from 'react';
import { useState } from 'react';
import Image from 'next/image'; // Import Next.js Image component
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';

interface InitialScreenProps {
  onNextStep: () => void;
}

const InitialScreen: FC<InitialScreenProps> = ({ onNextStep }) => {
  const [isButtonEnabled, setIsButtonEnabled] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const isDisabled = isLoadingStatus || !isButtonEnabled;

  const handleButtonClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      onNextStep();
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-card px-4">
      <Card className="w-full max-w-md border-none shadow-none bg-card">
        <CardContent className="flex flex-col items-center justify-center gap-y-12 p-6 md:p-8">
          {/* The local AppHeader is replaced with a themed image */}
          <Image
            src="https://placehold.co/200x120/F26522/FFFFFF/png?text=Arborist+Pro&font=lato"
            alt="Arborist Pro Logo"
            width={200}
            height={120}
            className="rounded-lg shadow-md"
            priority // Load this image first as it's above the fold
          />

          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <Button
              size="lg"
              onClick={handleButtonClick}
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