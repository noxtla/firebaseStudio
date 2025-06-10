
"use client";

import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera as CameraIcon, CheckCircle, AlertTriangle, RefreshCw, MapPin, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import type { CapturedLocation } from '@/types';

interface PhotoStepProps {
  onPhotoCaptured: (
    imageDataUrl: string | null,
    captureTimestamp?: string,
    location?: CapturedLocation | null
  ) => void;
  capturedImage: string | null;
  formattedUserInitials: string | null;
}

const PhotoStep: FC<PhotoStepProps> = ({ onPhotoCaptured, capturedImage, formattedUserInitials }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const [locationData, setLocationData] = useState<CapturedLocation | null>(null);
  const [locationStatus, setLocationStatus] = useState<'idle' | 'fetching' | 'success' | 'error'>('idle');
  const [locationErrorMsg, setLocationErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (capturedImage) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    let isCameraCancelled = false;

    const getCameraPermission = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(null);
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }
          });
          if (isCameraCancelled) {
            mediaStream.getTracks().forEach(track => track.stop());
            return;
          }
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setHasCameraPermission(true);
        } catch (err) {
          if (isCameraCancelled) return;
          console.error("Error accessing camera:", err);
          setStream(null);
          setHasCameraPermission(false);
          let message = "Could not access camera. Please ensure permissions are granted.";
          if (err instanceof Error) {
            if (err.name === "NotAllowedError") {
              message = "Camera access denied. Please grant permission in your browser settings.";
            } else if (err.name === "NotFoundError") {
              message = "No camera found. Please ensure a camera is connected and enabled.";
            }
          }
          toast({
            title: "Camera Error",
            description: message,
            variant: "destructive",
          });
        }
      } else {
        setHasCameraPermission(false);
        toast({
          title: "Camera Error",
          description: "Camera access is not supported by this browser.",
          variant: "destructive",
        });
      }
    };

    getCameraPermission();

    return () => {
      isCameraCancelled = true;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
       if (videoRef.current && videoRef.current.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      setStream(null);
    };
  }, [capturedImage, toast]);


  useEffect(() => {
    if (stream && hasCameraPermission === true && !capturedImage && locationStatus === 'idle') {
      if (navigator.geolocation) {
        setLocationStatus('fetching');
        setLocationErrorMsg(null);
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocationData({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              timestamp: position.timestamp,
            });
            setLocationStatus('success');
            toast({
              title: "Location Captured",
              description: "Your location has been successfully recorded.",
              variant: "default", 
              action: <MapPin className="text-green-500" />,
            });
          },
          (error) => {
            console.error("Error getting location:", error);
            setLocationErrorMsg(error.message || "Could not retrieve location.");
            setLocationStatus('error');
            setLocationData(null);
            toast({
              title: "Location Error",
              description: `Could not retrieve location: ${error.message}. Photo capture is disabled until location is available.`,
              variant: "destructive",
            });
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      } else {
        setLocationErrorMsg("Geolocation is not supported by this browser.");
        setLocationStatus('error');
        toast({
          title: "Location Error",
          description: "Geolocation is not supported by this browser. Photo capture is disabled.",
          variant: "destructive",
        });
      }
    }
  }, [stream, hasCameraPermission, capturedImage, locationStatus, toast]);


  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.setTransform(1, 0, 0, 1, 0, 0);

        const imageDataUrl = canvas.toDataURL('image/jpeg');
        const captureTimestamp = new Date().toISOString();
        onPhotoCaptured(imageDataUrl, captureTimestamp, locationData);
        toast({
          title: "Photo Captured!",
          description: "Your photo has been successfully captured.",
          variant: "default", 
          action: <CheckCircle className="text-green-500" />,
        });
      }
    }
  };

  const retakePhoto = () => {
    onPhotoCaptured(null);
    setLocationData(null);
    setLocationStatus('idle');
    setLocationErrorMsg(null);
  };

  const renderLocationStatus = () => {
    if (capturedImage) return null;

    if (locationStatus === 'fetching') {
      return (
        <div className="flex items-center justify-center text-sm text-muted-foreground mt-2">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Fetching location...
        </div>
      );
    }
    if (locationStatus === 'success' && locationData) {
      return (
        <div className="flex items-center justify-center text-sm text-green-600 mt-2">
          <MapPin className="mr-2 h-4 w-4" />
          Location captured (Accuracy: {locationData.accuracy.toFixed(0)}m)
        </div>
      );
    }
    if (locationStatus === 'error' && locationErrorMsg) {
      return (
        <Alert variant="destructive" className="mt-2 w-full">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Location Error</AlertTitle>
          <AlertDescription>{locationErrorMsg} Photo capture is disabled until location can be obtained.</AlertDescription>
        </Alert>
      );
    }
     if (locationStatus === 'idle' && stream && hasCameraPermission === true) {
      return (
        <div className="flex items-center justify-center text-sm text-muted-foreground mt-2">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Waiting for location...
        </div>
      );
    }
    return null;
  };

  const getCaptureButtonText = () => {
    if (locationStatus === 'idle') return 'Waiting for Location...';
    if (locationStatus === 'fetching') return 'Fetching Location...';
    if (locationStatus === 'error') return 'Location Unavailable';
    if (locationStatus === 'success') return 'Capture Photo';
    return 'Capture Photo';
  };

  const CaptureButtonIcon = (locationStatus === 'idle' || locationStatus === 'fetching') ? Loader2 : CameraIcon;
  const isCaptureButtonDisabled = locationStatus !== 'success';

  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="space-y-4 pt-6">
        <p className="text-lg text-muted-foreground mb-3 text-center font-heading-style">
          {formattedUserInitials}
        </p>
        <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center relative border border-input">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className={cn(
              "w-full h-full object-cover transform scale-x-[-1]",
              (!!capturedImage || hasCameraPermission !== true || !stream) && "hidden"
            )}
            aria-label="Live camera feed"
          />

          {capturedImage && (
             <Image src={capturedImage} alt="Captured photo" layout="fill" objectFit="contain" data-ai-hint="person selfie" className="transform scale-x-[-1]" />
          )}

          {hasCameraPermission === null && !capturedImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <CameraIcon className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Initializing camera...</p>
            </div>
          )}

          {hasCameraPermission === false && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <Alert variant="destructive" className="w-full">
                <AlertTriangle className="h-5 w-5" />
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access to use this feature. You may need to grant permissions in your browser settings for this site.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {renderLocationStatus()}

        {!capturedImage && hasCameraPermission === true && stream && (
          <Button
            onClick={handleCapture}
            className="w-full"
            size="lg"
            aria-label="Capture photo"
            disabled={isCaptureButtonDisabled}
          >
            <CaptureButtonIcon className={cn("mr-2 h-5 w-5", (locationStatus === 'idle' || locationStatus === 'fetching') && "animate-spin")} />
            {getCaptureButtonText()}
          </Button>
        )}
        {capturedImage && (
           <Button onClick={retakePhoto} variant="outline" className="w-full" size="lg" aria-label="Retake photo">
            <RefreshCw className="mr-2 h-5 w-5" /> Retake Photo
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PhotoStep;
