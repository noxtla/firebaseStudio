
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Gauge, User, CalendarDays, Clock, Loader2 } from 'lucide-react';
import type { UserData } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast"; // Import useToast
import { Toaster } from '@/components/ui/toaster'; // Import Toaster

export default function AddMilesPage() {
  const [mileageInfo, setMileageInfo] = useState<MileageInfo | null>(null);
  const [isLoadingInitialData, setIsLoadingInitialData] = useState(true); // Renamed for clarity
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for submission loading
  const [newMileage, setNewMileage] = useState(''); // State for new mileage input
  const router = useRouter();
  const { toast } = useToast(); // Initialize useToast

  useEffect(() => {
    const truckNumberFromSession = typeof window !== 'undefined' ? sessionStorage.getItem('currentTruckNumber') : 'N/A';
    let driverNameFromSession = 'N/A';
    if (typeof window !== 'undefined') {
        const storedUserData = sessionStorage.getItem('userData');
        if (storedUserData) {
            try {
                const parsedUserData: UserData = JSON.parse(storedUserData);
                driverNameFromSession = parsedUserData.Name || 'N/A';
            } catch (error) {
                console.error("Failed to parse user data from session storage", error);
            }
        }
    }

    setMileageInfo({
      truckNumber: truckNumberFromSession || 'N/A',
      driverName: driverNameFromSession,
      lastRecordedMileage: "12345 miles", // Placeholder
      lastDrivenDate: "2024-07-15", // Placeholder
      lastDropOffTime: "17:30", // Placeholder
    });
    setIsLoadingInitialData(false);
  }, []);

  const InfoRow = ({ label, value, icon: Icon }: { label: string; value: string; icon?: React.ElementType }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex items-center">
        {Icon && <Icon className="h-5 w-5 mr-3 text-muted-foreground" />}
        <p className="font-medium text-muted-foreground">{label}:</p>
      </div>
      <p className="text-foreground text-right">{value}</p>
    </div>
  );

  const handleSubmitNewMileage = async () => {
    if (!newMileage.trim() || isNaN(parseFloat(newMileage))) {
        toast({
            title: "Invalid Input",
            description: "Please enter a valid mileage number.",
            variant: "destructive",
        });
        return;
    }
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay
    
    // Placeholder submission logic
    toast({
        title: "Mileage Submitted (Placeholder)",
        description: `New mileage ${newMileage} for truck ${mileageInfo?.truckNumber} logged.`,
    });
    
    router.back();
    // setIsSubmitting(false); // Component likely unmounts
  };

  if (isLoadingInitialData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-2">Loading mileage information...</p>
      </div>
    );
  }

  if (!mileageInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p>Could not load mileage information.</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <Toaster /> {/* Add Toaster */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2" disabled={isSubmitting}>
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <AppHeader className="flex-grow" />
      </div>

      <div className="flex-grow flex flex-col items-center">
        <Card className="w-full max-w-2xl shadow-lg rounded-lg border-none">
          <CardHeader className="items-center text-center">
            <Gauge className="h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-2xl font-heading-style">
              Add Miles
            </CardTitle>
            <CardDescription>Truck: {mileageInfo.truckNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 pt-4 text-sm sm:text-base">
            <InfoRow label="Last Recorded Mileage" value={mileageInfo.lastRecordedMileage} icon={Gauge} />
            <InfoRow label="Driver" value={mileageInfo.driverName} icon={User} />
            <InfoRow label="Last Driven Date" value={mileageInfo.lastDrivenDate} icon={CalendarDays} />
            <InfoRow label="Vehicle Drop-off Time (Last)" value={mileageInfo.lastDropOffTime} icon={Clock} />
            
            <div className="pt-6 mt-4 border-t border-border">
              <h3 className="text-lg font-semibold text-center mb-4 text-foreground">Enter New Mileage</h3>
              <div className="space-y-2 mb-4">
                <Label htmlFor="newMileage" className="text-muted-foreground">New Mileage Reading</Label>
                <Input 
                  id="newMileage" 
                  type="number" 
                  placeholder="e.g., 12500" 
                  className="text-base" 
                  value={newMileage}
                  onChange={(e) => setNewMileage(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <Button 
                className="w-full" 
                size="lg" 
                onClick={handleSubmitNewMileage} 
                disabled={isSubmitting || !newMileage.trim()}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? "Submitting..." : "Submit New Mileage"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
