
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChevronLeft, Truck } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from '@/components/ui/toaster';

export default function EnterTruckNumberPage() {
  const [truckNumber, setTruckNumber] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numbers = rawValue.replace(/\D/g, ''); // Remove all non-digits
    let formattedNumber = '';

    if (numbers.length > 0) {
      if (numbers.length <= 3) {
        formattedNumber = numbers;
      } else if (numbers.length <= 7) {
        formattedNumber = `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
      } else {
        // Limit to 7 digits (NNN-NNNN)
        formattedNumber = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}`;
      }
    }
    setTruckNumber(formattedNumber);
  };

  const handleSubmit = () => {
    // Validate for NNN-NNNN format (7 digits + 1 hyphen)
    if (!/^\d{3}-\d{4}$/.test(truckNumber)) {
      toast({
        title: "Invalid Format",
        description: "Please enter the truck number in NNN-NNNN format.",
        variant: "destructive",
      });
      return;
    }
    sessionStorage.setItem('currentTruckNumber', truckNumber);
    router.push('/vehicles/actions');
  };

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
        <Card className="w-full max-w-md shadow-lg rounded-lg">
          <CardHeader className="items-center">
            <Truck className="h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-2xl text-center font-heading-style">Enter Truck Number</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="truckNumber" className="sr-only">Truck Number</Label>
              <Input
                id="truckNumber"
                value={truckNumber}
                onChange={handleInputChange}
                placeholder="e.g., 123-4567"
                className="text-base text-center"
                aria-label="Truck Number"
                inputMode="numeric" // Helps mobile users get numeric keyboard
                maxLength={8} // NNN-NNNN (7 digits + 1 hyphen)
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmit} className="w-full" size="lg">
              Continue
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
