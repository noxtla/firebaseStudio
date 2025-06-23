"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Truck as TruckIcon, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from '@/components/ui/toaster';


interface TrailerContextInfo {
  truckNumber: string;
}

export default function AddTrailerPage() {
  const [trailerContext, setTrailerContext] = useState<TrailerContextInfo | null>(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true);
  const [trailerNumber, setTrailerNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const truckNumberFromSession = typeof window !== 'undefined' ? sessionStorage.getItem('currentTruckNumber') : 'N/A';
    
    setTrailerContext({
      truckNumber: truckNumberFromSession || 'N/A',
    });
    setIsLoadingInitialData(false);
  }, []);

  const handleSubmitTrailer = async () => {
    if (!trailerNumber.trim()) {
        toast({
            title: "Invalid Input",
            description: "Please enter a trailer number.",
            variant: "destructive",
        });
        return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    
    toast({
        title: "Trailer Added (Placeholder)",
        description: `Trailer ${trailerNumber} added to truck ${trailerContext?.truckNumber}.`,
    });
    
    router.back();
  };

  if (isLoadingInitialData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2">Loading trailer information...</p>
      </div>
    );
  }

  if (!trailerContext) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p>Could not load truck information.</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <Toaster />
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2" disabled={isSubmitting}>
          <ChevronLeft className="h-8 w-8" />
        </Button>
        {/* AppHeader removed from here, it is now global */}
      </div>

      <div className="flex-grow flex flex-col items-center">
        <Card className="w-full max-w-2xl shadow-lg rounded-lg border-none">
          <CardHeader className="items-center text-center">
            <TruckIcon className="h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-2xl font-heading-style">
              Add Trailer
            </CardTitle>
            <CardDescription>To Truck: {trailerContext.truckNumber}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 text-sm sm:text-base">
            <div className="pt-0 mt-0">
              <h3 className="text-lg font-semibold text-center mb-4 text-foreground">Enter New Trailer Details</h3>
              <div className="space-y-2 mb-4">
                <Label htmlFor="trailerNumber" className="text-muted-foreground">Trailer Number</Label>
                <Input 
                  id="trailerNumber" 
                  type="text" 
                  placeholder="e.g., TRL-12345" 
                  className="text-base"
                  value={trailerNumber}
                  onChange={(e) => setTrailerNumber(e.target.value)} 
                  disabled={isSubmitting}
                />
              </div>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleSubmitTrailer} 
                disabled={isSubmitting || !trailerNumber.trim()}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Adding..." : "Add Trailer to Truck"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}