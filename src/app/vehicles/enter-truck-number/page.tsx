
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { ChevronLeft, Truck } from 'lucide-react'; // Added Truck icon for title
import { useToast } from "@/hooks/use-toast"; // For notifications
import { Toaster } from '@/components/ui/toaster';

export default function EnterTruckNumberPage() {
  const [truckNumber, setTruckNumber] = useState('');
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = () => {
    if (truckNumber.trim() === '') {
      toast({
        title: "Input Required",
        description: "Please enter a truck number.",
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
        {/* Using AppHeader which displays "Tree Services" */}
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
                onChange={(e) => setTruckNumber(e.target.value.toUpperCase())} // Convert to uppercase for consistency
                placeholder="e.g., T-123, Unit 45"
                className="text-base text-center"
                aria-label="Truck Number"
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
