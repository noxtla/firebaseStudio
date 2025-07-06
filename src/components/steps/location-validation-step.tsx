"use client";

import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { UserData, CapturedLocation } from '@/types';
import { WEBHOOK_URL } from '@/config/appConfig';

// --- Estados permitidos para locationStatus ---
const locationStates = ['idle', 'fetching', 'success', 'error'] as const;
type LocationStatus = typeof locationStates[number];

interface LocationValidationStepProps {
  userData: UserData;
  onLocationValidated: (location: CapturedLocation) => void;
  isActiveStep: boolean;
}

const LocationValidationStep: FC<LocationValidationStepProps> = ({ userData, onLocationValidated, isActiveStep }) => {
  const { toast } = useToast();
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle');
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);
  const [capturedLocation, setCapturedLocation] = useState<CapturedLocation | null>(null);

  const [showAlertDialog, setShowAlertDialog] = useState(false);
  const [alertDialogMessage, setAlertDialogMessage] = useState('');
  const [alertDialogTitle, setAlertDialogTitle] = useState('');
  const [alertDialogIcon, setAlertDialogIcon] = useState<React.ElementType | null>(null);
  const [alertDialogIconColor, setAlertDialogIconColor] = useState('');

  useEffect(() => {
    if (!isActiveStep) {
      setLocationStatus('idle');
      setLocationErrorMsg(null);
      setCapturedLocation(null);
      setShowAlertDialog(false);
    }
  }, [isActiveStep]);

  const fetchLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      const msg = "Geolocation is not supported by this browser.";
      setLocationErrorMsg(msg);
      setLocationStatus('error');
      toast({
        title: "Location Error",
        description: msg,
        variant: "destructive",
      });
      return;
    }

    setLocationStatus('fetching');
    setLocationErrorMsg(null);
    setCapturedLocation(null);
    setShowAlertDialog(false);

    const geoOptions = { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const newLocation: CapturedLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        setCapturedLocation(newLocation);

        try {
          const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'location',
              capturedLocation: newLocation,
              userData: userData,
            }),
          });

          const responseData = await response.json();
          const insideCompany = responseData?.insideCompany === "true";
          const rawDistance = responseData?.Distance;

          if (!response.ok) {
            const errorMessage = responseData?.message || "Unknown error from server.";

            if (responseData?.Error === "User is outside of the designated work area") {
              setAlertDialogTitle("Location Status: Outside Company");
              setAlertDialogIcon(AlertTriangle);
              setAlertDialogIconColor("text-yellow-500");

              const parsedDistance = parseFloat(rawDistance);
              const miles = !isNaN(parsedDistance) ? Math.round(parsedDistance * 10) / 10 : 'N/A';
              setAlertDialogMessage(`You are currently outside the designated company area. You are approximately ${miles} miles away.`);
              setShowAlertDialog(true);
            } else {
              toast({
                title: "Network Error",
                description: "Could not connect to the server to validate location: " + errorMessage,
                variant: "destructive",
              });
            }

            setLocationErrorMsg(errorMessage);
            setLocationStatus('error');
          } else {
            if (insideCompany) {
              setLocationStatus('success');
              onLocationValidated(newLocation);
              toast({
                title: "Location Validated!",
                description: `Your location has been successfully verified. Accuracy: ${newLocation?.accuracy?.toFixed(0)}m.`,
                variant: "default",
                action: <CheckCircle2 className="text-green-500" />,
              });
            } else {
              setLocationStatus('success');
              onLocationValidated(newLocation);

              setAlertDialogTitle("Location Status: Outside Company");
              setAlertDialogIcon(AlertTriangle);
              setAlertDialogIconColor("text-yellow-500");

              const parsedDistance = parseFloat(rawDistance);
              const miles = !isNaN(parsedDistance) ? Math.round(parsedDistance * 10) / 10 : 'N/A';
              setAlertDialogMessage(`You are currently outside the designated company area. You are approximately ${miles} miles away.`);
              setShowAlertDialog(true);
            }
          }
        } catch (error) {
          console.error("Error procesando respuesta del webhook de ubicación:", error);
          setLocationErrorMsg("An unexpected error occurred while processing location data.");
          setLocationStatus('error');
          toast({
            title: "Processing Error",
            description: "An unexpected error occurred while validating location data.",
            variant: "destructive",
          });
        }
      },
      (error) => {
        let message = "Could not retrieve location.";
        if (error.code === error.PERMISSION_DENIED) {
          message = "Location access denied. Please allow location access in your browser/device settings.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = "Location information is unavailable. Try again later.";
        } else if (error.code === error.TIMEOUT) {
          message = "The request to get user location timed out. Please try again.";
        }
        setLocationErrorMsg(message);
        setLocationStatus('error');
        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
      },
      geoOptions
    );
  }, [userData, onLocationValidated, toast]);

  const getStatusTitle = () => {
    switch (locationStatus) {
      case 'idle': return 'Ready to Validate Location';
      case 'fetching': return 'Validating Location...';
      case 'success': return 'Location Validated!';
      case 'error': return 'Location Validation Failed';
      default: return 'Location Status';
    }
  };

  const getStatusDescription = () => {
    switch (locationStatus) {
      case 'idle': return 'Press "Validate Location" to begin the process. You will be asked for permission if not granted already.';
      case 'fetching': return 'Please wait while we determine your precise location and validate it against authorized work areas.';
      case 'success':
        return capturedLocation ? `Your current location has been verified. Accuracy: ${capturedLocation?.accuracy?.toFixed(0)}m.` : 'Location verified.';
      case 'error': return locationErrorMsg || 'An unknown error occurred during location validation.';
      default: return '';
    }
  };

  const AlertDialogIconComponent = alertDialogIcon;

  return (
    <Card className="w-full max-w-md border-none shadow-none flex flex-col items-center justify-center text-center">
      <CardHeader>
        {locationStatus === 'fetching' && <Loader2 className="h-12 w-12 animate-spin text-primary mb-2" />}
        {locationStatus === 'success' && !showAlertDialog && <CheckCircle2 className="h-12 w-12 text-success mb-2 animate-soft-pulse" />}
        {(locationStatus === 'error' || (locationStatus === 'success' && showAlertDialog)) && <AlertTriangle className="h-12 w-12 text-destructive mb-2 animate-shake" />}
        {locationStatus === 'idle' && <MapPin className="h-12 w-12 text-muted-foreground mb-2" />}
        <CardTitle className="text-2xl font-heading-style">{getStatusTitle()}</CardTitle>
        <CardDescription className="px-4">{getStatusDescription()}</CardDescription>
      </CardHeader>
      <CardContent className="w-full">
        {(locationStatus === 'idle' || locationStatus === 'error' || (locationStatus === 'success' && showAlertDialog)) && (
          <Button onClick={fetchLocation} disabled={locationStatus === 'fetching'} className="w-full mt-6">
            {locationStatus === 'fetching' ? 'Validating...' : locationStatus === 'error' ? 'Try Again' : 'Validate Location'}
          </Button>
        )}
        {locationStatus === 'success' && !showAlertDialog && (
          <Button disabled className="w-full mt-6 bg-success text-success-foreground hover:bg-success/90">
            Location Validated
          </Button>
        )}
      </CardContent>

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
          </AlertDialogDescription>
          <AlertDialogFooter className="flex justify-center sm:justify-center">
            <AlertDialogAction onClick={() => setShowAlertDialog(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default LocationValidationStep;
