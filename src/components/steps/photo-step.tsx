
"use client";

import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardFooter
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Camera, /* ArrowLeft, ArrowRight, */ CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'; // Removed ArrowLeft, ArrowRight
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PhotoStepProps {
  onPhotoCaptured: (imageDataUrl: string | null) => void;
  // onNextStep: () => void; // Removed
  // onPrevStep: () => void; // Removed
  capturedImage: string | null;
}

const PhotoStep: FC<PhotoStepProps> = ({ onPhotoCaptured, capturedImage }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null); // null: undecided, true: granted, false: denied/error
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (capturedImage) { // If an image is already captured, stop the stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      return;
    }

    let isCancelled = false;

    const getCameraPermission = async () => {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        setHasCameraPermission(null); // Reset to undecided while attempting
        try {
          const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: "user" } // Prioritize front camera
          });
          if (isCancelled) { // Check if component unmounted or effect re-ran
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
          if (err instanceof Error) { // More specific error messages
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
        // Browser doesn't support getUserMedia
        setHasCameraPermission(false);
        toast({
          title: "Camera Error",
          description: "Camera access is not supported by this browser.",
          variant: "destructive",
        });
      }
    };

    getCameraPermission();

    return () => { // Cleanup function
      isCancelled = true;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      // Ensure video srcObject is also cleaned up if it was set directly
      if (videoRef.current && videoRef.current.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
      setStream(null); // Clear stream state on unmount or re-run
    };
  }, [capturedImage, toast]); // Rerun effect if capturedImage changes (to re-enable camera after retake) or toast changes

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current && stream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      // Set canvas dimensions to video stream's dimensions
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        // Flip the image horizontally for a mirror effect, common for "selfie" cameras
        context.translate(canvas.width, 0);
        context.scale(-1, 1);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Reset transform before getting data URL
        context.setTransform(1, 0, 0, 1, 0, 0); 
        
        const imageDataUrl = canvas.toDataURL('image/jpeg'); // Use JPEG for smaller file size
        onPhotoCaptured(imageDataUrl);
        toast({
          title: "Photo Captured!",
          description: "Your photo has been successfully captured.",
          variant: "default", // Changed from success for consistency if not defined
          action: <CheckCircle className="text-green-500" />,
        });
      }
    }
  };

  const retakePhoto = () => {
    onPhotoCaptured(null); // This will trigger the useEffect to re-initialize the camera
  };

  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="space-y-4 pt-6">
        <div className="aspect-video bg-muted rounded-md overflow-hidden flex items-center justify-center relative border border-input">
          {/* Video element is always in DOM, hidden/shown with CSS */}
          <video
            ref={videoRef}
            autoPlay
            playsInline // Important for iOS
            muted // Mute to avoid feedback loops if mic was also requested (though we only request video)
            className={cn(
              "w-full h-full object-cover transform scale-x-[-1]", // Mirror effect
              (!!capturedImage || hasCameraPermission !== true || !stream) && "hidden" // Hide if image captured, no permission, or no stream
            )}
            aria-label="Live camera feed"
          />

          {capturedImage && (
             <Image src={capturedImage} alt="Captured photo" layout="fill" objectFit="contain" data-ai-hint="person selfie" />
          )}
          
          {/* Loading/Initializing state */}
          {hasCameraPermission === null && !capturedImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <Camera className="h-12 w-12 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Initializing camera...</p>
            </div>
          )}

          {/* Permission denied or error state */}
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
        <canvas ref={canvasRef} style={{ display: 'none' }} /> {/* Hidden canvas for processing */}
        
        {/* Buttons for capture/retake */}
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
      {/* CardFooter with Previous/Next buttons removed, handled by MultiStepForm */}
    </Card>
  );
};

export default PhotoStep;
