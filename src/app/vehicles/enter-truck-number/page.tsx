
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
  const [validVehicleNumbers, setValidVehicleNumbers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setErrorMessage(null);
    if (typeof window !== 'undefined') {
      const storedUserData = sessionStorage.getItem('userData');
      if (storedUserData) {
        try {
          const parsedUserData: UserData = JSON.parse(storedUserData);
          if (parsedUserData.Vehicles && parsedUserData.Vehicles.length > 0) {
            setValidVehicleNumbers(parsedUserData.Vehicles.map(v => String(v).replace(/\D/g, '')));
          } else {
            setErrorMessage("No vehicles are assigned to this user.");
            toast({
              title: "No Vehicles Found",
              description: "No vehicles are assigned to your profile. Please contact support if this is an error.",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Failed to parse user data from session storage", error);
          setErrorMessage("Failed to load user data. Please try logging in again.");
          toast({
            title: "Data Error",
            description: "Could not load user data. Please try logging in again.",
            variant: "destructive",
          });
          router.replace('/'); // Redirect if user data is corrupted
        }
      } else {
        setErrorMessage("User data not found. Please log in again.");
        toast({
          title: "Login Required",
          description: "User information is missing. Please log in again.",
          variant: "destructive",
        });
        router.replace('/'); // Redirect to login if no user data
      }
    }
    setIsLoading(false);
  }, [router, toast]);

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
    if (isLoading || errorMessage) return false;
    if (!/^\d{3}-\d{4}$/.test(truckNumber)) {
      return false;
    }
    const numericTruckNumber = truckNumber.replace(/-/g, '');
    return validVehicleNumbers.includes(numericTruckNumber);
  }, [truckNumber, validVehicleNumbers, isLoading, errorMessage]);

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
        description: "The entered truck number is not recognized or not assigned to you. Please check and try again.",
        variant: "destructive",
      });
      return;
    }
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('currentTruckNumber', truckNumber);
    }
    router.push('/vehicles/actions');
  };

  const isButtonDisabled = isLoading || !!errorMessage || !isTruckNumberValidForSubmission;

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
                pattern="[0-9-]*" // Allow digits and hyphen for formatting
                maxLength={8} 
                disabled={isLoading || !!errorMessage}
              />
            </div>
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

