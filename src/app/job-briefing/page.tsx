"use client";

import React, { useState } from 'react';
import HorizontalTabBar from '@/components/horizontal-tab-bar2';
import AppHeader from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import JobBriefingGeneralTab from '@/components/job-briefing-general-tab';

const jobBriefingTabLabels = ["General", "Emergencia", "Tareas", "Riesgos", "Controles", "Revisión"];

export default function JobBriefingPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("General");

  const renderTabContent = () => {
    switch (activeTab) {
      case "General":
        return <JobBriefingGeneralTab />;
      default:
        return <div>Hello World</div>;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <AppHeader className="flex-grow text-center" />
      </div>

      <HorizontalTabBar labels={jobBriefingTabLabels} onTabClick={(tab) => setActiveTab(tab)} />

      <div className="mt-6">
        {renderTabContent()}
      </div>
    </div>
  );
}
