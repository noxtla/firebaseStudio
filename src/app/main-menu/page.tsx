
// src/app/main-menu/page.tsx
"use client";

import type { FC } from 'react';
import Link from 'next/link'; // Placeholder for future navigation
import {
  CalendarCheck,
  Truck,
  ClipboardList,
  ShieldCheck,
  MessageSquare,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import AppHeader from '@/components/app-header';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button'; // Using Button for consistent styling

interface MenuItemProps {
  title: string;
  icon: React.ElementType;
  href?: string; // For future navigation
  isSecondary?: boolean;
}

const MenuItem: FC<MenuItemProps> = ({ title, icon: Icon, href = "#", isSecondary }) => {
  return (
    // Using Button component styled as a card for consistency and touch feedback
    <Button
      variant="outline"
      className="w-full h-auto justify-start p-4 sm:p-6 text-left bg-card hover:bg-accent/50 border-border rounded-lg shadow-sm transition-all duration-200 ease-in-out"
      asChild // To allow Link or other elements inside if needed
    >
      <Link href={href} passHref>
        <div className="flex items-center w-full">
          <Icon className={`h-7 w-7 sm:h-8 sm:w-8 mr-4 ${isSecondary ? 'text-destructive' : 'text-primary'}`} />
          <div className="flex-grow">
            <h3 className={`text-lg sm:text-xl font-semibold ${isSecondary ? 'text-destructive-foreground' : 'text-card-foreground'}`}>
              {title}
            </h3>
          </div>
          <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto" />
        </div>
      </Link>
    </Button>
  );
};

const MainMenuPage: FC = () => {
  const primaryMenuItems: MenuItemProps[] = [
    { title: 'Attendance', icon: CalendarCheck },
    { title: 'Vehicles', icon: Truck },
    { title: 'Job Briefing', icon: ClipboardList },
    { title: 'Safety', icon: ShieldCheck },
  ];

  const secondaryMenuItems: MenuItemProps[] = [
    { title: 'Support', icon: MessageSquare, isSecondary: true },
    { title: 'Emergency Support', icon: AlertTriangle, isSecondary: true },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="w-full max-w-md mx-auto px-4">
        <AppHeader className="mt-8 mb-8" />
      </div>

      <main className="flex-grow overflow-y-auto p-4 pt-0">
        <div className="w-full max-w-2xl mx-auto space-y-4 sm:space-y-6">
          <Card className="w-full border-none shadow-none bg-transparent">
            <CardHeader className="p-0 mb-4 sm:mb-6">
              <CardTitle className="text-2xl sm:text-3xl text-center font-heading-style text-foreground">Main Menu</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {primaryMenuItems.map((item) => (
                  <MenuItem key={item.title} {...item} />
                ))}
              </div>

              <Separator className="my-6 sm:my-8 bg-border" />

              <div className="grid grid-cols-1 gap-3 sm:gap-4">
                {secondaryMenuItems.map((item) => (
                  <MenuItem key={item.title} {...item} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default MainMenuPage;
