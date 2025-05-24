
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation'; // For potential back button or actions
import { Gauge, Truck, Fuel, TriangleAlert, ChevronLeft, type LucideIcon } from 'lucide-react'; // Changed Trailer to Truck
import AppHeader from '@/components/app-header';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardHeader, CardTitle as they are not used
import { Button } from '@/components/ui/button';
// import { cn } from '@/lib/utils'; // cn is not used

interface VehicleMenuItemProps {
  title: string;
  icon: LucideIcon;
  href: string;
  description?: string;
}

const VehicleMenuItem: FC<VehicleMenuItemProps> = ({ title, icon: Icon, href, description }) => {
  return (
    <Link href={href} passHref legacyBehavior>
      <a className="block transition-all duration-200 ease-in-out transform hover:scale-105">
        <Card className="w-full h-full flex flex-col items-center justify-center text-center p-6 shadow-md hover:shadow-lg rounded-lg border bg-card">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-0">
            <Icon className="h-10 w-10 text-primary mb-2" />
            <p className="text-lg font-semibold text-foreground">{title}</p>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </CardContent>
        </Card>
      </a>
    </Link>
  );
};

export default function VehiclesMenuPage() {
  const router = useRouter();

  const menuItems: VehicleMenuItemProps[] = [
    { title: 'Add Miles', icon: Gauge, href: '#', description: "Log vehicle mileage" },
    { title: 'Add Trailer', icon: Truck, href: '#', description: "Record trailer attachment" }, // Changed Trailer to Truck
    { title: 'Add Gas', icon: Fuel, href: '#', description: "Input fuel consumption" },
    { title: 'Add Defects', icon: TriangleAlert, href: '#', description: "Report vehicle issues" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <AppHeader className="flex-grow !text-left ml-0 pl-0" />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 flex-grow">
        {menuItems.map((item) => (
          <VehicleMenuItem key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
}

