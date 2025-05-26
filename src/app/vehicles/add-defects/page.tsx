
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, TriangleAlert as ReportProblemIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from '@/components/ui/toaster';

const TRUCK_DEFECTS_LIST = [
  "Air Compressor", "Air Lines", "Battery", "Brake Accessories", "Brakes", "Carburetor", 
  "Clutch", "Coupling Devices", "Defroster/Heater", "Drive Line", "Engine", "Exhaust", 
  "Fifth Wheel", "Frame & Assembly", "Front Axle", "Fuel Tanks", "Horn", 
  "Lights (Head, Stop, Tail, Dash, Turn Indicators)", "Mirrors", "Oil Pressure", 
  "Radiator", "Rear End", "Reflectors", 
  "Safety Equipment (Fire Extinguisher, Flags, Flares, Fuses, Reflective Triangles)", 
  "Springs", "Starter", "Steering", "Tachograph", "Tires", "Transmission", 
  "Trip Recorder", "Wheels, Rims, Lugs, Spacers", "Windows", "Windshield Wipers", "Other Truck Defect"
];

const TRAILER_DEFECTS_LIST = [
  "Air Lines", "Brake Connections", "Brakes", "Coupling Devices (King Pin/Apron)", 
  "Coupling (Pin/Chains)", "Doors", "Frame & Body", "Hitch", "Landing Gear", 
  "Lights (All)", "Reflectors/Reflective Tape", "Roof", "Springs", "Suspension", 
  "Tarpaulin", "Tires", "Wheels & Rims", "Other Trailer Defect"
];

interface SelectedDefects {
  truck: string[];
  trailer: string[];
  otherTruckText: string;
  otherTrailerText: string;
}

export default function AddDefectsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [selectedDefects, setSelectedDefects] = useState<SelectedDefects>({
    truck: [],
    trailer: [],
    otherTruckText: '',
    otherTrailerText: '',
  });

  const handleCheckboxChange = (category: 'truck' | 'trailer', defect: string, checked: boolean) => {
    setSelectedDefects((prev) => {
      const currentCategoryDefects = prev[category];
      const newCategoryDefects = checked
        ? [...currentCategoryDefects, defect]
        : currentCategoryDefects.filter((d) => d !== defect);
      return { ...prev, [category]: newCategoryDefects };
    });
  };

  const handleSubmit = () => {
    console.log('Selected Defects:', selectedDefects);
    // Placeholder for actual submission logic
    toast({
      title: "Defects Logged (Placeholder)",
      description: `Truck: ${selectedDefects.truck.join(', ') || 'None'}. Trailer: ${selectedDefects.trailer.join(', ') || 'None'}. Other Truck: ${selectedDefects.otherTruckText || 'N/A'}. Other Trailer: ${selectedDefects.otherTrailerText || 'N/A'}`,
    });
    // Potentially navigate back or to a confirmation screen
    // router.back(); 
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <Toaster />
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <AppHeader className="flex-grow" />
      </div>

      <Card className="w-full flex-grow flex flex-col shadow-lg rounded-lg border-none">
        <CardHeader className="items-center text-center">
          <ReportProblemIcon className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-heading-style">
            Add Vehicle Defects
          </CardTitle>
          <CardDescription>Select any observed defects for the truck and/or trailer.</CardDescription>
        </CardHeader>
        
        <ScrollArea className="flex-grow p-0">
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-foreground border-b pb-2">Truck Defects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                {TRUCK_DEFECTS_LIST.map((defect) => (
                  <div key={`truck-${defect}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`truck-${defect}`}
                      checked={selectedDefects.truck.includes(defect)}
                      onCheckedChange={(checked) => handleCheckboxChange('truck', defect, !!checked)}
                    />
                    <Label htmlFor={`truck-${defect}`} className="text-sm font-normal cursor-pointer">
                      {defect}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedDefects.truck.includes("Other Truck Defect") && (
                <Textarea
                  placeholder="Specify other truck defect(s)..."
                  value={selectedDefects.otherTruckText}
                  onChange={(e) => setSelectedDefects(prev => ({ ...prev, otherTruckText: e.target.value }))}
                  className="mt-3 text-sm"
                />
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-foreground border-b pb-2">Trailer Defects</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                {TRAILER_DEFECTS_LIST.map((defect) => (
                  <div key={`trailer-${defect}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`trailer-${defect}`}
                      checked={selectedDefects.trailer.includes(defect)}
                      onCheckedChange={(checked) => handleCheckboxChange('trailer', defect, !!checked)}
                    />
                    <Label htmlFor={`trailer-${defect}`} className="text-sm font-normal cursor-pointer">
                      {defect}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedDefects.trailer.includes("Other Trailer Defect") && (
                <Textarea
                  placeholder="Specify other trailer defect(s)..."
                  value={selectedDefects.otherTrailerText}
                  onChange={(e) => setSelectedDefects(prev => ({ ...prev, otherTrailerText: e.target.value }))}
                  className="mt-3 text-sm"
                />
              )}
            </div>
          </CardContent>
        </ScrollArea>
        
        <CardFooter className="flex justify-end pt-6 border-t mt-auto">
          <Button size="lg" onClick={handleSubmit}>
            Submit Defects
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

