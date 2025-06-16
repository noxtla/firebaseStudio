"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChevronLeft, Truck, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from '@/components/ui/toaster';
import type { UserData } from '@/types';

export default function EnterTruckNumberPage() {
  const [truckNumber, setTruckNumber] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchVehicleDetails = async (currentUser: UserData) => {
      try {
        const response = await fetch('https://noxtla.app.n8n.cloud/webhook/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phoneNumber: currentUser.phoneNumber,
            action: 'vehicules' // MODIFIED as requested
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch vehicle details.');
        }
        
        const data = await response.json();
        
        if (data && data[0]?.Vehicles) {
          const updatedUserData = { ...currentUser, Vehicles: data[0].Vehicles };
          sessionStorage.setItem('userData', JSON.stringify(updatedUserData));
        } else {
           console.warn("User has no vehicles assigned.");
        }

      } catch (error: any) {
        console.error("Error fetching vehicle details:", error);
        setErrorMessage(error.message || "Could not load vehicle data.");
        toast({
          title: "Error",
          description: "Could not load vehicle data. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      const storedUserData = sessionStorage.getItem('userData');
      if (storedUserData) {
        const parsedUserData: UserData = JSON.parse(storedUserData);
        if (!parsedUserData.Vehicles) {
          fetchVehicleDetails(parsedUserData);
        } else {
          setIsLoading(false);
        }
      } else {
        toast({
          title: "Login Required",
          description: "User information is missing. Please log in again.",
          variant: "destructive",
        });
        router.replace('/');
      }
    }
  }, [router, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, ''); 
    setTruckNumber(rawValue);
  };

  const handleSubmit = async () => {
    if (truckNumber.trim().length === 0) {
        toast({
            title: "Input Required",
            description: "Please enter a truck number.",
            variant: "destructive",
        });
        return;
    }
    
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentTruckNumber', truckNumber);
    }
    router.push('/vehicles/actions');
  };

  const isButtonDisabled = isLoading || isSubmitting;

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <Toaster />
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2" disabled={isSubmitting}>
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <AppHeader className="flex-grow !text-left ml-0 pl-0" />
      </div>

      <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg rounded-lg border-none">
          <CardHeader className="items-center">
            <Truck className="h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-2xl text-center font-heading-style">Enter Truck Number</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            {isLoading && (
              <div className="flex items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading vehicle information...
              </div>
            )}
            {errorMessage && !isLoading && (
              <p className="text-sm text-center text-destructive">
                Error: {errorMessage}
              </p>
            )}
            {!isLoading && !errorMessage && (
              <div className="space-y-2">
                <Label htmlFor="truckNumber" className="sr-only">Truck Number</Label>
                <Input
                  id="truckNumber"
                  value={truckNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., 1234567"
                  className="text-base text-center"
                  aria-label="Truck Number"
                  inputMode="numeric" 
                  pattern="[0-9]*" 
                  disabled={isSubmitting}
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSubmit} 
              className="w-full" 
              size="lg"
              disabled={isButtonDisabled}
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? "Loading..." : isSubmitting ? "Proceeding..." : "Continue"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
