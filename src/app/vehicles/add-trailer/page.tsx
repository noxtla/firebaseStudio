
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Truck as TruckIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserData } from '@/types'; // Assuming UserData might be useful if we extend this

interface TrailerInfo {
  truckNumber: string;
  lastDriver: string;
  lastUsedDate: string;
  lastDropOffTime: string;
}

export default function AddTrailerPage() {
  const [trailerInfo, setTrailerInfo] = useState<TrailerInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [trailerNumber, setTrailerNumber] = useState('');
  const router = useRouter();

  useEffect(() => {
    const truckNumberFromSession = typeof window !== 'undefined' ? sessionStorage.getItem('currentTruckNumber') : 'N/A';
    
    setTrailerInfo({
      truckNumber: truckNumberFromSession || 'N/A',
      lastDriver: "John Doe", // Dummy data
      lastUsedDate: "2024-07-14", // Dummy data
      lastDropOffTime: "10:00 AM", // Dummy data
    });
    setIsLoading(false);
  }, []);

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
      <div className="flex items-center">
        <p className="font-medium text-muted-foreground">{label}:</p>
      </div>
      <p className="text-foreground text-right">{value}</p>
    </div>
  );

  const handleSubmitTrailer = () => {
    // For now, just navigate back. Actual submission logic would go here.
    // console.log("Adding trailer:", trailerNumber, "to truck:", trailerInfo?.truckNumber);
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p>Loading trailer information...</p>
      </div>
    );
  }

  if (!trailerInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p>Could not load trailer information.</p>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <AppHeader className="flex-grow" />
      </div>

      <div className="flex-grow flex flex-col items-center">
        <Card className="w-full max-w-2xl shadow-lg rounded-lg border-none">
          <CardHeader className="items-center text-center">
            <TruckIcon className="h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-2xl font-heading-style">
              Add Trailer
            </CardTitle>
            <CardDescription>To Truck: {trailerInfo.truckNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1 pt-4 text-sm sm:text-base">
            <InfoRow label="Last Driver (Trailer)" value={trailerInfo.lastDriver} />
            <InfoRow label="Last Used Date (Trailer)" value={trailerInfo.lastUsedDate} />
            <InfoRow label="Last Drop-off Time (Trailer)" value={trailerInfo.lastDropOffTime} />
            
            <div className="pt-6 mt-4 border-t border-border">
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
                />
              </div>
              <Button className="w-full" size="lg" onClick={handleSubmitTrailer} disabled={!trailerNumber}>
                Add Trailer to Truck
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
