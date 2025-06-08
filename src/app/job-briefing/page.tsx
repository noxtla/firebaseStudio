
"use client";

import React from 'react';
import HorizontalTabBar from '@/components/horizontal-tab-bar2';
import AppHeader from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter

// Example tab labels for Job Briefing. You can customize these.
const jobBriefingTabLabels = ["General", "Emergencia", "Tareas", "Riesgos", "Controles", "Revisión"];

export default function JobBriefingPage() {
  const router = useRouter(); // Initialize router

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <AppHeader className="flex-grow text-center" />
      </div>
      
      <HorizontalTabBar labels={jobBriefingTabLabels} />
      
      <div className="mt-6 text-center">
        <h1 className="text-2xl font-bold text-foreground mb-4">Sesión Informativa Laboral</h1>
        <p className="text-muted-foreground">
          El contenido de cada pestaña aparecerá aquí. Por favor, selecciona una pestaña para ver su contenido.
        </p>
        {/* Placeholder content - you'll likely replace this with dynamic content based on the active tab */}
      </div>
    </div>
  );
}
