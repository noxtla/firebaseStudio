"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChevronLeft, Info as InfoIcon } from 'lucide-react';

interface VehicleInfo {
  truckNumber: string;
  engineNumber: string;
  licensePlate: string;
  serialNumber: string;
  year: string;
  model: string;
  vehicleType: string;
  lastOilChangeService: string;
  lastAuditDate: string;
}

export default function VehicleInfoPage() {
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfo | null>(null);
  const router = useRouter();

  useEffect(() => {
    const truckNumberFromSession = typeof window !== 'undefined' ? sessionStorage.getItem('currentTruckNumber') : 'N/A';
    setVehicleInfo({
      truckNumber: truckNumberFromSession || 'N/A',
      engineNumber: "DUMMY-ENG-12345",
      licensePlate: "DUMMY-PLT-678",
      serialNumber: "DUMMY-SN-90123",
      year: "2022",
      model: "Heavy Duty Truck X1",
      vehicleType: "Truck - Class A",
      lastOilChangeService: "2024-03-15",
      lastAuditDate: "2024-05-20",
    });
  }, []);

  if (!vehicleInfo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <p>Loading vehicle information...</p>
      </div>
    );
  }

  const InfoRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between py-2 border-b border-border last:border-b-0">
      <p className="font-medium text-muted-foreground">{label}:</p>
      <p className="text-foreground text-right">{value}</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-8 w-8" />
        </Button>
        {/* AppHeader removed from here, it is now global */}
      </div>

      <div className="flex-grow flex flex-col items-center">
        <Card className="w-full max-w-2xl shadow-lg rounded-lg border-none">
          <CardHeader className="items-center text-center">
            <InfoIcon className="h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-2xl font-heading-style">
              Vehicle Information
            </CardTitle>
            <CardDescription>Details for Truck: {vehicleInfo.truckNumber}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 pt-4 text-sm sm:text-base">
            <InfoRow label="Engine Number" value={vehicleInfo.engineNumber} />
            <InfoRow label="License Plate" value={vehicleInfo.licensePlate} />
            <InfoRow label="Serial Number" value={vehicleInfo.serialNumber} />
            <InfoRow label="Year" value={vehicleInfo.year} />
            <InfoRow label="Model" value={vehicleInfo.model} />
            <InfoRow label="Vehicle Type" value={vehicleInfo.vehicleType} />
            <InfoRow label="Last Oil Change" value={vehicleInfo.lastOilChangeService} />
            <InfoRow label="Last Audit Date" value={vehicleInfo.lastAuditDate} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}