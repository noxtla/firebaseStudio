
"use client";

import { useState, type FC } from 'react'; // Added useState
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Gauge, Caravan, Fuel, TriangleAlert, Info, ChevronLeft, Loader2, type LucideIcon } from 'lucide-react'; // Added Loader2
import AppHeader from '@/components/app-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils'; // Added cn

interface VehicleMenuItemProps {
  title: string;
  icon: LucideIcon;
  href: string;
  description?: string;
}

const VehicleMenuItem: FC<VehicleMenuItemProps> = ({ title, icon: Icon, href, description }) => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault(); // Prevent default link behavior to show loader
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay for loader visibility
    router.push(href);
    // No need to setIsLoading(false) as component will unmount
  };

  return (
    <Link href={href} passHref legacyBehavior>
      <a
        onClick={handleClick}
        className={cn(
          "block transition-all duration-200 ease-in-out transform hover:scale-105",
          isLoading && "opacity-75 cursor-wait"
        )}
      >
        <Card className="w-full h-full flex flex-col items-center justify-center text-center p-6 shadow-md hover:shadow-lg rounded-lg border bg-card">
          <CardContent className="flex flex-col items-center justify-center gap-3 p-0">
            {isLoading ? (
              <Loader2 className="h-10 w-10 text-primary mb-2 animate-spin" />
            ) : (
              <Icon className="h-10 w-10 text-primary mb-2" />
            )}
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

export default function VehicleActionsPage() {
  const router = useRouter();

  const menuItems: VehicleMenuItemProps[] = [
    { title: 'Add Miles', icon: Gauge, href: '/vehicles/add-miles', description: "Log vehicle mileage" },
    { title: 'Add Trailer', icon: Caravan, href: '/vehicles/add-trailer', description: "Record trailer attachment" },
    { title: 'Add Gas', icon: Fuel, href: '/vehicles/add-gas/select-type', description: "Input fuel consumption" },
    { title: 'Add Defects', icon: TriangleAlert, href: '/vehicles/add-defects', description: "Report vehicle issues" },
    { title: 'Vehicle Information', icon: Info, href: '/vehicles/info', description: "View vehicle details" },
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
