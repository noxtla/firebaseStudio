"use client";

import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Timer } from 'lucide-react';

interface SessionTimeoutDialogProps {
  isOpen: boolean;
  countdown: number;
  onExtend: () => void;
  onLogout: () => void;
}

export const SessionTimeoutDialog: React.FC<SessionTimeoutDialogProps> = ({
  isOpen,
  countdown,
  onExtend,
  onLogout,
}) => {
  // Format countdown into MM:SS for display
  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <AlertDialog open={isOpen}>
      <AlertDialogContent>
        <AlertDialogHeader className="items-center">
          <Timer className="h-12 w-12 text-yellow-500 mb-2" />
          <AlertDialogTitle>Are you still there?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You've been inactive for a while. For your security, your session will end in{' '}
            <span className="font-bold text-foreground">{formattedTime}</span>.
            <br />
            Do you need more time?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 w-full justify-center">
          <Button variant="outline" onClick={onLogout} className="w-full sm:w-auto">
            Log Out
          </Button>
          <AlertDialogAction onClick={onExtend} className="w-full sm:w-auto">
            Extend Session
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};