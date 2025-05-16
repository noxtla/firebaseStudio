
"use client";

import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PhotoStepProps {
  onPhotoCaptured: (imageDataUrl: string | null, timestamp?: string) => void;
  capturedImage: string | null;
}

const PhotoStep: FC<PhotoStepProps> = ({ onPhotoCaptured, capturedImage }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (capturedImage) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    let isCancelled = false;

    const getCameraPermission = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(null);
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" }
          });
          if (isCancelled) {
            mediaStream.getTracks().forEach(track => track.stop());
            return;
          }
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setHasCameraPermission(true);
        } catch (err) {
          if (isCancelled) return;
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
      isCancelled = true;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      setStream(null);
    };
  }, [capturedImage, toast]);

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
        const timestamp = new Date().toISOString();
        onPhotoCaptured(imageDataUrl, timestamp);
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
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="space-y-4 pt-6">
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
             <Image src={capturedImage} alt="Captured photo" layout="fill" objectFit="contain" data-ai-hint="person selfie" />
          )}
          
          {hasCameraPermission === null && !capturedImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <Camera className="h-12 w-12 text-muted-foreground mb-2" />
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
    </Card>
  );
};

export default PhotoStep;
