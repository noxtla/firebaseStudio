
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Truck as TruckIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// UserData import can be removed if not used elsewhere after this change
// import type { UserData } from '@/types'; 

interface TrailerContextInfo { // Renamed from TrailerInfo and simplified
  truckNumber: string;
}

export default function AddTrailerPage() {
  const [trailerContext, setTrailerContext] = useState<TrailerContextInfo | null>(null); // Renamed state
  const [isLoading, setIsLoading] = useState(true);
  const [trailerNumber, setTrailerNumber] = useState('');
  const router = useRouter();

  useEffect(() => {
    const truckNumberFromSession = typeof window !== 'undefined' ? sessionStorage.getItem('currentTruckNumber') : 'N/A';
    
    setTrailerContext({ // Updated state being set
      truckNumber: truckNumberFromSession || 'N/A',
      // Removed lastDriver, lastUsedDate, lastDropOffTime
    });
    setIsLoading(false);
  }, []);

  // InfoRow component is no longer needed here if all InfoRows are removed
  // const InfoRow = ({ label, value }: { label: string; value: string }) => (
  //   <div className="flex items-center justify-between py-3 border-b border-border last:border-b-0">
  //     <div className="flex items-center">
  //       <p className="font-medium text-muted-foreground">{label}:</p>
  //     </div>
  //     <p className="text-foreground text-right">{value}</p>
  //   </div>
  // );

  const handleSubmitTrailer = () => {
    // For now, just navigate back. Actual submission logic would go here.
    // console.log("Adding trailer:", trailerNumber, "to truck:", trailerContext?.truckNumber);
    router.back();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p>Loading trailer information...</p>
      </div>
    );
  }

  if (!trailerContext) { // Updated check
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p>Could not load truck information.</p>
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
            <CardDescription>To Truck: {trailerContext.truckNumber}</CardDescription>
          </CardHeader>
          <CardContent className="pt-4 text-sm sm:text-base"> {/* Removed space-y-1 as InfoRows are gone */}
            {/* Removed InfoRow calls for Last Driver, Last Used Date, Last Drop-off Time */}
            
            <div className="pt-0 mt-0"> {/* Adjusted padding/margin as previous content is removed */}
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
