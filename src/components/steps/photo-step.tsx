"use client";

import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Camera, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import Image from 'next/image';

interface PhotoStepProps {
  onPhotoCaptured: (imageDataUrl: string) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  capturedImage: string | null;
}

const PhotoStep: FC<PhotoStepProps> = ({ onPhotoCaptured, onNextStep, onPrevStep, capturedImage }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (capturedImage) { // If image already captured, don't restart camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }
    
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: "user" } 
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setError(null);
      } catch (err) {
        console.error("Error accessing camera:", err);
        let message = "Could not access camera. Please ensure permissions are granted.";
        if (err instanceof Error) {
            if (err.name === "NotAllowedError") {
                message = "Camera access denied. Please grant permission in your browser settings.";
            } else if (err.name === "NotFoundError") {
                message = "No camera found. Please ensure a camera is connected and enabled.";
            }
        }
        setError(message);
        toast({
          title: "Camera Error",
          description: message,
          variant: "destructive",
        });
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capturedImage]); // Rerun if capturedImage is cleared

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        onPhotoCaptured(imageDataUrl);
        stream.getTracks().forEach(track => track.stop()); // Stop camera after capture
        setStream(null);
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
    onPhotoCaptured(""); // Clear the captured image
    setError(null);
    // useEffect will restart the camera
  };

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Take a Photo</CardTitle>
        <CardDescription className="text-center">
          Please take a live photo of yourself.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center relative">
          {error && !capturedImage && (
            <div className="p-4 text-center text-destructive-foreground bg-destructive rounded-md flex flex-col items-center">
              <AlertTriangle className="w-12 h-12 mb-2" />
              <p>{error}</p>
            </div>
          )}
          {!capturedImage && stream && (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
              aria-label="Live camera feed"
            />
          )}
          {capturedImage && (
             <Image src={capturedImage} alt="Captured photo" layout="fill" objectFit="contain" data-ai-hint="person selfie" />
          )}
          {!error && !stream && !capturedImage && (
             <p className="text-muted-foreground">Initializing camera...</p>
          )}
        </div>
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {!capturedImage && stream && !error && (
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
        <Button variant="outline" onClick={onPrevStep} aria-label="Go to previous step">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={onNextStep} disabled={!capturedImage} aria-label="Complete verification and go to next step">
          Complete <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PhotoStep;
