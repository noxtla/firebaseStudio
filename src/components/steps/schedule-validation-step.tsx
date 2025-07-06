"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CalendarCheck2, Loader2, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { UserData } from '@/types';
import { WEBHOOK_URL } from '@/config/appConfig';
import { // New import for AlertDialog
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";


interface ScheduleValidationStepProps {
  userData: UserData;
  onScheduleValidated: () => void;
  // Nueva prop para indicar si el paso está "activo" y debe intentar validar el horario
  isActiveStep: boolean;
}

const ScheduleValidationStep: FC<ScheduleValidationStepProps> = ({ userData, onScheduleValidated, isActiveStep }) => {
  const { toast } = useToast();
  // Changed status types to align with exact requirements (in_window, out_of_window)
  const [scheduleStatus, setScheduleStatus] = useState<'idle' | 'checking' | 'in_window' | 'out_of_window' | 'error'>('idle');
  const [scheduleErrorMsg, setScheduleErrorMsg] = useState<string | null>(null);
  const [currentColumbusTime, setCurrentColumbusTime] = useState<string | null>(null); // New state for Columbus time

  // AlertDialog control states
  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState('');
  const [alertDialogTitle, setAlertDialogTitle] = useState('');
  const [alertDialogIcon, setAlertDialogIcon] = useState<React.ElementType | null>(null);
  const [alertDialogIconColor, setAlertDialogIconColor] = useState('');

  useEffect(() => {
    // Resets the state of this component when it's no longer the active step,
    // or when it first becomes active (to ensure a fresh start).
    if (!isActiveStep) {
      setScheduleStatus('idle');
      setScheduleErrorMsg(null);
      setCurrentColumbusTime(null); // Reset Columbus time when not active
      setShowAlertDialog(false); // Reset alert dialog
    }
  }, [isActiveStep]);

  const checkSchedule = useCallback(async () => {
    // Only proceed if this step is currently active in the form flow
    if (!isActiveStep) return;

    setScheduleStatus('checking');
    setScheduleErrorMsg(null);
    setShowAlertDialog(false); // Close any existing alert before starting a new check

    try {
      console.log("Enviando webhook con action: 'scheduleCheck'...");
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scheduleCheck',
          phoneNumber: userData.phoneNumber.replace(/\D/g, ''), // Ensure clean phone number is sent
          userData: userData,
        }),
      });

      const responseData = await response.json();
      console.log("Response from scheduleCheck webhook:", responseData);

      // Extract relevant data from the webhook response
      // Assuming the response is an array with the first element containing the data
      const isOnTimeWindow = responseData[0]?.is_on_time_window;
      const timeDifference = responseData[0]?.time_difference;
      const columbusTime = responseData[0]?.current_columbus_time;

      setCurrentColumbusTime(columbusTime || null); // Always update Columbus time if available

      if (response.ok) { // Check if HTTP status is OK (2xx)
        if (isOnTimeWindow) {
          setScheduleStatus('in_window');
          onScheduleValidated(); // Signal to parent component that schedule is validated
          toast({
            title: "Schedule Validated!",
            description: "You are within the allowed attendance window.",
            variant: "default",
            action: <CheckCircle2 className="text-green-500" />,
          });
        } else { // Webhook returned OK but isOnTimeWindow is false
          setScheduleStatus('out_of_window');
          setScheduleErrorMsg(timeDifference || "You are outside of the allowed hours to record attendance.");
          
          // Set up and show the AlertDialog with the time difference message
          setAlertDialogTitle("Time Window Alert");
          setAlertDialogIcon(AlertTriangle);
          setAlertDialogIconColor("text-yellow-500");
          setAlertDialogMessage(timeDifference || "You are outside of the allowed hours to record attendance.");
          setShowAlertDialog(true);

          toast({
            title: "Attendance Not Available",
            description: timeDifference || "You are outside of the allowed hours to record attendance.",
            variant: "destructive",
          });
        }
      } else { // HTTP status is not OK (e.g., 4xx, 5xx)
        setScheduleStatus('error');
        const errorMessage = responseData?.message || "An unknown error occurred from server.";
        setScheduleErrorMsg(errorMessage);
        toast({
          title: "Network Error",
          description: `Could not connect to the server or server returned an error: ${errorMessage}`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error al enviar el webhook de horario:", error);
      setScheduleErrorMsg("Failed to validate schedule with server. Network error or server issue.");
      setScheduleStatus('error');
      toast({
        title: "Network Error",
        description: "Could not connect to the server to validate your schedule.",
        variant: "destructive",
      });
    }
  }, [isActiveStep, userData, onScheduleValidated, toast]);

  useEffect(() => {
    // This effect calls checkSchedule when the component becomes active and is in an 'idle' state.
    // It prevents re-checking if the status is already 'checking', 'in_window', or 'out_of_window'.
    if (isActiveStep && scheduleStatus === 'idle') {
      checkSchedule();
    }
  }, [isActiveStep, scheduleStatus, checkSchedule]);

  const getStatusTitle = () => {
    switch (scheduleStatus) {
      case 'idle': return 'Ready to Check Schedule';
      case 'checking': return 'Checking Schedule...';
      case 'in_window': return 'Within Attendance Window!';
      case 'out_of_window': return 'Outside Attendance Window';
      case 'error': return 'Schedule Check Failed';
      default: return 'Schedule Status';
    }
  };

  const getStatusDescription = () => {
    switch (scheduleStatus) {
      case 'idle': return 'Press "Check Schedule" to verify your allowed attendance hours.';
      case 'checking': return 'Please wait while we verify your eligibility to record attendance at this time.';
      case 'in_window': return 'You are within the valid time frame to log your attendance.';
      case 'out_of_window': return scheduleErrorMsg || 'You are currently outside the designated hours for recording attendance.';
      case 'error': return scheduleErrorMsg || 'An unknown error occurred during schedule validation.';
      default: return '';
    }
  };

  const AlertDialogIconComponent = alertDialogIcon;

  return (
    <Card className="w-full max-w-md border-none shadow-none flex flex-col items-center justify-center text-center">
      <CardHeader>
        {/* Render appropriate icon based on schedule status */}
        {scheduleStatus === 'checking' && <Loader2 className="h-12 w-12 animate-spin text-primary mb-2" />}
        {scheduleStatus === 'in_window' && <CheckCircle2 className="h-12 w-12 text-success mb-2 animate-soft-pulse" />}
        {(scheduleStatus === 'out_of_window' || scheduleStatus === 'error') && <AlertTriangle className="h-12 w-12 text-destructive mb-2 animate-shake" />}
        {scheduleStatus === 'idle' && <CalendarCheck2 className="h-12 w-12 text-muted-foreground mb-2" />}
        
        <CardTitle className="text-2xl font-heading-style">{getStatusTitle()}</CardTitle>
        
        {/* Display Columbus time if available */}
        {currentColumbusTime && (
            <p className="text-sm font-semibold text-muted-foreground">Columbus Time: {currentColumbusTime}</p>
        )}
        
        <CardDescription className="px-4">{getStatusDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        {/* Display a regular Alert component for immediate feedback if there's an error or out of window */}
        {(scheduleStatus === 'out_of_window' || scheduleStatus === 'error') && (
          <Alert variant="destructive" className="mt-4 text-left">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {scheduleErrorMsg}
            </AlertDescription>
          </Alert>
        )}

        {/* Action button to trigger schedule check */}
        {scheduleStatus !== 'checking' && scheduleStatus !== 'in_window' && (
          <Button onClick={checkSchedule} disabled={scheduleStatus === 'checking'} className="w-full mt-6">
            {scheduleStatus === 'checking' ? 'Checking...' : 'Check Schedule'}
          </Button>
        )}
        
        {/* "Try Again" button for error/out_of_window states */}
        {(scheduleStatus === 'out_of_window' || scheduleStatus === 'error') && (
          <Button onClick={checkSchedule} variant="outline" className="w-full mt-4">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        )}
      </CardContent>

      {/* AlertDialog component for blocking notifications */}
      <AlertDialog open={showAlertDialog} onOpenChange={setShowAlertDialog}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            {AlertDialogIconComponent && (
              <AlertDialogIconComponent className={`h-12 w-12 mb-2 ${alertDialogIconColor}`} />
            )}
            <AlertDialogTitle>{alertDialogTitle}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center">
            {alertDialogMessage}
            {currentColumbusTime && ( // Also display Columbus time in the alert dialog for context
              <p className="mt-2 text-sm text-foreground">Current Columbus Time: {currentColumbusTime}</p>
            )}
          </AlertDialogDescription>
          <AlertDialogFooter className="flex justify-center sm:justify-center">
            <AlertDialogAction onClick={() => setShowAlertDialog(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ScheduleValidationStep;