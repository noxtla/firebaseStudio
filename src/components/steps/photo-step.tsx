
"use client";

import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PhotoStepProps {
  onPhotoCaptured: (imageDataUrl: string | null) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  capturedImage: string | null;
}

const PhotoStep: FC<PhotoStepProps> = ({ onPhotoCaptured, onNextStep, onPrevStep, capturedImage }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); // null: pending, true: granted, false: denied
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (capturedImage) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      // If an image is captured, permission must have been granted at some point.
      // We don't need to change hasCameraPermission here.
      return;
    }

    const getCameraPermission = async () => {
      setHasCameraPermission(null); // Set to pending before request
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" }
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setHasCameraPermission(true);
      } catch (err) {
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
    };

    getCameraPermission();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
    };
  }, [capturedImage, toast]); // Effect dependencies

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally for a mirror effect if it's from the front camera
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        context.setTransform(1, 0, 0, 1, 0, 0); // Reset transform
        
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        onPhotoCaptured(imageDataUrl);
        // Stream is stopped by the useEffect when capturedImage changes
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
    onPhotoCaptured(null); // Reset to null to trigger useEffect to restart camera
    // hasCameraPermission will be reset to null then to true/false by useEffect
  };

  return (
    <Card className="w-full shadow-xl">
      <CardContent className="space-y-4 pt-6">
        <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center relative border border-input">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted // Muted is important for autoplay on mobile
            className={cn(
              "w-full h-full object-cover transform scale-x-[-1]", // Mirror effect for front camera
              // Show only if no image, permission granted, and stream exists
              (capturedImage || hasCameraPermission !== true || !stream) && "hidden"
            )}
            aria-label="Live camera feed"
          />

          {capturedImage && (
             <Image src={capturedImage} alt="Captured photo" layout="fill" objectFit="contain" data-ai-hint="person selfie" />
          )}
          
          {/* UI states overlaid on the video area if video is hidden */}
          {hasCameraPermission === null && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-muted-foreground p-4 text-center">Initializing camera...</p>
            </div>
          )}

          {hasCameraPermission === false && !capturedImage && (
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <Alert variant="destructive" className="w-full">
                <AlertTriangle className="h-5 w-5" /> {/* Lucide icon */}
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                  Please allow camera access to use this feature. You may need to grant permissions in your browser settings for this site.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {!capturedImage && hasCameraPermission === true && stream && (
          <Button onClick={handleCapture} className="w-full" size="lg" aria-label="Capture photo">
            <Camera className="mr-2 h-5 w-5" /> Capture Photo
          </Button>
        )}
        {capturedImage && (
           <Button onClick={retakePhoto} variant="outline" className="w-full" size="lg" aria-label="Retake photo">
            <RefreshCw className="mr-2 h-5 w-5" /> Retake Photo
          </Button>
        )}

      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={onPrevStep} aria-label="Go to previous step">
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={onNextStep} disabled={!capturedImage} aria-label="Complete verification and go to next step">
          Complete <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PhotoStep;

