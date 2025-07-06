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

interface ScheduleValidationStepProps {
  userData: UserData;
  onScheduleValidated: () => void;
  // Nueva prop para indicar si el paso está "activo" y debe intentar validar el horario
  isActiveStep: boolean;
}

const ScheduleValidationStep: FC<ScheduleValidationStepProps> = ({ userData, onScheduleValidated, isActiveStep }) => {
  const { toast } = useToast();
  const [scheduleStatus, setScheduleStatus] = useState<'idle' | 'checking' | 'in_window' | 'out_of_window' | 'error'>('idle');
  const [scheduleErrorMsg, setScheduleErrorMsg] = useState<string | null>(null);

  const checkSchedule = useCallback(async () => {
    if (!isActiveStep) return; // Solo intentar si este es el paso activo

    setScheduleStatus('checking');
    setScheduleErrorMsg(null);

    try {
      console.log("Enviando webhook con action: 'scheduleCheck'...");
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scheduleCheck',
          phoneNumber: userData.phoneNumber.replace(/\D/g, ''), // Asegurarse de enviar el número limpio
          userData: userData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData?.Error === "User is outside of the allowed hours to record attendance") {
          setScheduleStatus('out_of_window');
          setScheduleErrorMsg("You are outside of the allowed hours to record attendance.");
          toast({
            title: "Attendance Not Available",
            description: "You are outside of the allowed hours to record attendance.",
            variant: "destructive",
          });
        } else {
          throw new Error(errorData.message || 'API validation failed');
        }
      } else {
        setScheduleStatus('in_window');
        onScheduleValidated();
        toast({
          title: "Schedule Validated!",
          description: "You are within the allowed attendance window.",
          variant: "default",
          action: <CheckCircle2 className="text-green-500" />,
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
    if (isActiveStep && scheduleStatus === 'idle') {
      checkSchedule();
    }
    // Reset state if we navigate away and come back
    if (!isActiveStep) {
      setScheduleStatus('idle');
      setScheduleErrorMsg(null);
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

  return (
    <Card className="w-full max-w-md border-none shadow-none flex flex-col items-center justify-center text-center">
      <CardHeader>
        {scheduleStatus === 'checking' && <Loader2 className="h-12 w-12 animate-spin text-primary mb-2" />}
        {scheduleStatus === 'in_window' && <CheckCircle2 className="h-12 w-12 text-success mb-2 animate-soft-pulse" />}
        {(scheduleStatus === 'out_of_window' || scheduleStatus === 'error') && <AlertTriangle className="h-12 w-12 text-destructive mb-2 animate-shake" />}
        {scheduleStatus === 'idle' && <CalendarCheck2 className="h-12 w-12 text-muted-foreground mb-2" />}
        <CardTitle className="text-2xl font-heading-style">{getStatusTitle()}</CardTitle>
        <CardDescription className="px-4">{getStatusDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        {(scheduleStatus === 'out_of_window' || scheduleStatus === 'error') && (
          <Alert variant="destructive" className="mt-4 text-left">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {scheduleErrorMsg}
            </AlertDescription>
          </Alert>
        )}
        {scheduleStatus !== 'checking' && scheduleStatus !== 'in_window' && (
          <Button onClick={checkSchedule} disabled={scheduleStatus === 'checking'} className="w-full mt-6">
            {scheduleStatus === 'checking' ? 'Checking...' : 'Check Schedule'}
          </Button>
        )}
        {(scheduleStatus === 'out_of_window' || scheduleStatus === 'error') && (
          <Button onClick={checkSchedule} variant="outline" className="w-full mt-4">
            <RefreshCw className="mr-2 h-4 w-4" /> Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default ScheduleValidationStep;