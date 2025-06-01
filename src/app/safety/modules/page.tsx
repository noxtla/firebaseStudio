
"use client";

import Link from 'next/link';
import { modulesData, type SafetyModule } from '@/data/safety-modules-data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ChevronLeft } from 'lucide-react';

export default function ModuleSelectionPage() {
  const defaultSelectedModuleId = 'module2'; // As per requirement "Module 2" is selected by default

  return (
    <div className="flex flex-col items-center w-full">
      <div className="w-full max-w-3xl mb-8">
        <Link href="/main-menu" passHref legacyBehavior>
          <Button variant="outline" className="mb-6 text-sm">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to Main Menu
          </Button>
        </Link>
        <Card className="bg-card shadow-lg border-none">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl md:text-3xl font-heading-style text-[hsl(var(--safety-blue-text-DEFAULT))]">
              Arborist Safety: Questionnaires
            </CardTitle>
            <CardDescription className="text-base md:text-lg text-muted-foreground">
              Select a Module
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modulesData.map((module: SafetyModule) => (
                <Link key={module.id} href={`/safety/modules/${module.id}`} passHref legacyBehavior>
                  <a className={cn(
                    "safety-module-button",
                    module.id === defaultSelectedModuleId && "safety-module-button-selected"
                  )}>
                    {module.shortTitle}
                    {module.id === defaultSelectedModuleId && <span className="ml-2">☜</span>}
                  </a>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
