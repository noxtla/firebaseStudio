
"use client";

import { useState, type FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gauge, Caravan, Fuel, TriangleAlert, Info, ChevronLeft, Loader2, type LucideIcon, Wrench } from 'lucide-react';
import AppHeader from '@/components/app-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface VehicleMenuItemProps {
  title: string;
  icon: LucideIcon;
  href?: string;
  description?: string;
  isPrimary?: boolean; // Added isPrimary prop to match MenuItemProps
  onClick?: () => Promise<void> | void; // Added onClick prop to match MenuItemProps
  isDisabled?: boolean;
  isLoading?: boolean;
}

const VehicleMenuItem: FC<VehicleMenuItemProps> = ({ title, icon: Icon, href, description, isDisabled, isLoading, onClick }) => {

  const content = (
    <Card
      className={cn(
        "w-full flex flex-col items-center justify-center transition-all duration-200 ease-in-out transform hover:scale-105 hover:shadow-lg border-none shadow-none",
        (isDisabled || isLoading) && "opacity-50 cursor-not-allowed hover:scale-100 hover:shadow-none",
        isLoading && "cursor-wait"
      )}
    >
      <CardContent className={cn(
        "flex-1 flex flex-col items-center justify-center text-center gap-2",
        "space-y-2 sm:space-y-3",
        "p-0"
      )}>
        {isLoading ? (
          <Loader2 className={cn("animate-spin text-primary", "h-10 w-10 sm:h-12 sm:w-12")} />
        ) : (
          <Icon className={cn("text-primary", "h-10 w-10 sm:h-12 sm:w-12")} />
        )}
        <p className={cn("font-medium text-foreground", "text-base sm:text-lg")}>{title}</p>
        {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
      </CardContent>
    </Card>
  );

  if (href && !onClick && !isDisabled && !isLoading) {
    return (
      <Link href={href} passHref legacyBehavior>
        <a className="flex h-full w-full">
          {content}
        </a>
      </Link>
    );
  }

    const handleClick = (e: React.MouseEvent) => {
        if (isDisabled || isLoading) {
          e.preventDefault();
          return;
        }
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      };

  return (
    <div
      onClick={handleClick}
      className={cn("flex h-full w-full cursor-pointer", isDisabled || isLoading ? "pointer-events-none" : "")}
      role="button"
      tabIndex={isDisabled || isLoading ? -1 : 0}
      aria-disabled={isDisabled || isLoading}
    >
      {content}
    </div>
  );
};

export default function VehicleActionsPage() {
  const router = useRouter();

  const menuItems: VehicleMenuItemProps[] = [
    { title: 'Add Miles', icon: Gauge, href: '/vehicles/add-miles', description: "Log vehicle mileage" },
    { title: 'Add Trailer', icon: Caravan, href: '/vehicles/add-trailer', description: "Record trailer attachment" },
    { title: 'Add Gas', icon: Fuel, href: '/vehicles/add-gas/select-type', description: "Input fuel consumption" },
    { title: 'Add Defects', icon: TriangleAlert, href: '/vehicles/add-defects', description: "Report vehicle issues" },
    { title: 'Vehicle Information', icon: Info, href: '/vehicles/info', description: "View vehicle details" },
    { title: 'Tool Inventory', icon: Wrench, href: '/vehicles/tool-inventory', description: "Manage tool inventory" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <AppHeader className="flex-grow text-center" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 flex-grow">
        {menuItems.map((item) => (
          <VehicleMenuItem key={item.title} {...item} />
        ))}
      </div>
    </div>
  );
}
