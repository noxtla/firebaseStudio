
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

interface Vehicle {
  VehicleNumber: string;
}

export default function EnterTruckNumberPage() {
  const [truckNumber, setTruckNumber] = useState('');
  const [validVehicleNumbers, setValidVehicleNumbers] = useState<string[]>([]);
  const [isLoadingNumbers, setIsLoadingNumbers] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [truckListApiResponse, setTruckListApiResponse] = useState<string | null>(null); // For debugging
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchValidNumbers = async () => {
      setIsLoadingNumbers(true);
      setFetchError(null);
      setTruckListApiResponse(null); 
      try {
        const response = await fetch('https://n8n.srv809556.hstgr.cloud/webhook-test/vehicles');
        const responseText = await response.text();
        setTruckListApiResponse(responseText); 

        if (!response.ok) {
          throw new Error(`Failed to fetch vehicle numbers: ${response.status}. Response: ${responseText || "No response body"}`);
        }
        
        if (!responseText.trim()) { // Explicitly check for empty or whitespace-only response
          throw new Error("Empty response received from server when fetching vehicle numbers.");
        }
        
        const data: Vehicle[] = JSON.parse(responseText);
        if (Array.isArray(data)) {
          setValidVehicleNumbers(data.map(v => v.VehicleNumber.replace(/\D/g, ''))); 
        } else {
          throw new Error("Invalid data format for vehicle numbers. Expected an array.");
        }
      } catch (error) {
        console.error("Error fetching valid truck numbers:", error);
        const errorMessage = error instanceof Error ? error.message : "Could not load vehicle list.";
        setFetchError(errorMessage);
        
        if (!truckListApiResponse && error instanceof Error) setTruckListApiResponse(errorMessage);
        else if (!truckListApiResponse) setTruckListApiResponse("Error processing vehicle list response.");
        
        toast({
          title: "Error",
          description: `Could not load vehicle list: ${errorMessage}`,
          variant: "destructive",
        });
      } finally {
        setIsLoadingNumbers(false);
      }
    };

    fetchValidNumbers();
  }, [toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numbers = rawValue.replace(/\D/g, ''); 
    let formattedNumber = '';

    if (numbers.length > 0) {
      if (numbers.length <= 3) {
        formattedNumber = numbers;
      } else if (numbers.length <= 7) {
        formattedNumber = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      } else {
        // Limit to 7 digits for NNN-NNNN format
        formattedNumber = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}`;
      }
    }
    setTruckNumber(formattedNumber);
  };

  const isTruckNumberValidForSubmission = useMemo(() => {
    if (!/^\d{3}-\d{4}$/.test(truckNumber)) {
      return false;
    }
    const numericTruckNumber = truckNumber.replace(/-/g, '');
    return validVehicleNumbers.includes(numericTruckNumber);
  }, [truckNumber, validVehicleNumbers]);

  const handleSubmit = () => {
    if (!/^\d{3}-\d{4}$/.test(truckNumber)) {
      toast({
        title: "Invalid Format",
        description: "Please enter the truck number in NNN-NNNN format.",
        variant: "destructive",
      });
      return;
    }

    const numericTruckNumber = truckNumber.replace(/-/g, '');
    if (!validVehicleNumbers.includes(numericTruckNumber)) {
      toast({
        title: "Invalid Truck Number",
        description: "The entered truck number is not recognized. Please check and try again.",
        variant: "destructive",
      });
      return;
    }

    if (fetchError && !isLoadingNumbers) { 
         toast({
            title: "Error",
            description: `Cannot proceed: ${fetchError}`,
            variant: "destructive",
        });
        return;
    }
    
    sessionStorage.setItem('currentTruckNumber', truckNumber);
    router.push('/vehicles/actions');
  };

  const isButtonDisabled = isLoadingNumbers || !isTruckNumberValidForSubmission || (!!fetchError && !isLoadingNumbers);

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <Toaster />
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
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
            {isLoadingNumbers && (
              <div className="flex items-center justify-center text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading valid truck numbers...
              </div>
            )}
            {fetchError && !isLoadingNumbers && (
              <p className="text-sm text-center text-destructive">
                Error: {fetchError}. Please try again later.
              </p>
            )}
            <div className="space-y-2">
              <Label htmlFor="truckNumber" className="sr-only">Truck Number</Label>
              <Input
                id="truckNumber"
                value={truckNumber}
                onChange={handleInputChange}
                placeholder="e.g., 123-4567"
                className="text-base text-center"
                aria-label="Truck Number"
                inputMode="numeric" 
                maxLength={8} 
                disabled={isLoadingNumbers || (!!fetchError && !isLoadingNumbers)}
              />
            </div>
            {truckListApiResponse && (
              <div className="mt-4 p-3 bg-muted rounded-md w-full overflow-x-auto">
                <h4 className="text-sm font-semibold mb-1 text-muted-foreground">Truck List API Response (Debug):</h4>
                <pre className="text-xs whitespace-pre-wrap break-all bg-background p-2 rounded border text-foreground">
                  {truckListApiResponse}
                </pre>
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
              Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
