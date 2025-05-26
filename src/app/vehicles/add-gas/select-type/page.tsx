
"use client";

import type { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Truck as TruckIcon, Package as PackageIcon, Fuel as FuelIcon, ChevronLeft, HelpCircle as HelpCircleIcon, type LucideIcon } from 'lucide-react';
import AppHeader from '@/components/app-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface OptionCardProps {
  title: string;
  icon: LucideIcon;
  href: string;
  description: string;
}

const OptionCard: FC<OptionCardProps> = ({ title, icon: Icon, href, description }) => {
  return (
    <Link href={href} passHref legacyBehavior>
      <a className="block transition-all duration-200 ease-in-out transform hover:scale-105">
        <Card className="w-full h-full flex flex-col items-center justify-center text-center p-6 shadow-md hover:shadow-lg rounded-lg border bg-card">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-0">
            <Icon className="h-12 w-12 text-primary mb-2" />
            <p className="text-xl font-semibold text-foreground">{title}</p>
            <p className="text-sm text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
      </a>
    </Link>
  );
};

export default function SelectGasTypePage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <AppHeader className="flex-grow" />
      </div>

      <div className="flex-grow flex flex-col items-center">
        <Card className="w-full max-w-md shadow-lg rounded-lg border-none mb-8 bg-transparent">
          <CardHeader className="items-center text-center">
            <FuelIcon className="h-12 w-12 text-primary mb-4" />
            <CardTitle className="text-3xl font-heading-style mb-1">Add Gas</CardTitle>
            <CardDescription className="text-lg text-muted-foreground">Where are you adding gas?</CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 gap-6 w-full max-w-md">
          <OptionCard
            title="To Truck"
            icon={TruckIcon}
            href="#" // Placeholder for now, e.g., /vehicles/add-gas/truck
            description="Log fuel added to the primary vehicle."
          />
          <OptionCard
            title="To Trailer Equipment"
            icon={PackageIcon}
            href="#" // Placeholder for now, e.g., /vehicles/add-gas/trailer-equipment
            description="Log fuel for trailer-mounted equipment (e.g., chipper, reefer)."
          />
          <OptionCard
            title="Other"
            icon={HelpCircleIcon}
            href="/vehicles/add-gas/other-reason"
            description="Specify other equipment or reason for adding gas."
          />
        </div>
      </div>
    </div>
  );
}
