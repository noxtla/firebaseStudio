"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";
import { X, User, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

const ScannerInterface = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const startCamera = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" } // Use back camera for scanning
        });
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      toast({
        title: "Camera Error",
        description: "Could not access the camera. Please check permissions.",
        variant: "destructive",
      });
      router.back();
    }
  }, [router, toast]);

  useEffect(() => {
    startCamera();
    return () => {
      // Cleanup: stop camera stream when component unmounts
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [startCamera]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 flex flex-col bg-black/90 text-white"
    >
      {/* Header */}
      <header className="flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold">Scanner</h2>
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="text-white hover:bg-white/10 hover:text-white">
          <X className="h-6 w-6" />
        </Button>
      </header>

      {/* Scanner View */}
      <main className="flex flex-grow flex-col items-center justify-center p-4">
        <p className="mb-4 text-center text-lg">
          Align face, text or QR code within the frame to scan.
        </p>
        <div className="relative w-full max-w-sm aspect-square">
          <div className="absolute inset-0 border-4 border-yellow-400 rounded-2xl animate-soft-pulse"></div>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover rounded-lg"
          />
        </div>
      </main>

      {/* Footer Actions */}
      <footer className="flex items-center justify-center space-x-6 p-6">
        <Button
            variant="secondary"
            className="h-20 w-20 flex-col space-y-1 bg-white/10 text-white hover:bg-white/20"
            onClick={() => toast({ title: "Facial Recognition Clicked" })}
        >
            <User className="h-8 w-8" />
            <span className="text-xs">Face</span>
        </Button>
        <Button
            variant="secondary"
            className="h-20 w-20 flex-col space-y-1 bg-white/10 text-white hover:bg-white/20"
            onClick={() => toast({ title: "Vehicle Scan Clicked" })}
        >
            <Truck className="h-8 w-8" />
            <span className="text-xs">Vehicle</span>
        </Button>
      </footer>
    </div>
  );
};

export default ScannerInterface;