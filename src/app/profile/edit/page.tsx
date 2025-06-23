"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2 } from 'lucide-react';

import HorizontalTabBar from '@/components/horizontal-tab-bar2';
import { Button } from '@/components/ui/button';
import EditProfileForm from '@/components/profile/edit-profile-form';
import type { UserData } from '@/types';

const profileTabLabels = ["Vehicles", "Profile", "DOT", "Driver License", "Warnings", "Especial Mentions"];

export default function EditProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Profile");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem("userData");
    if (storedData) {
      try {
        const parsedData: UserData = JSON.parse(storedData);
        // Ensure position exists, matching profile page logic
        if (!parsedData.Position) {
            parsedData.Position = "Field Worker";
        }
        setUserData(parsedData);
      } catch (error) {
        console.error("Failed to parse user data", error);
        router.replace("/main-menu");
      }
    } else {
      router.replace("/main-menu");
    }
    setIsLoading(false);
  }, [router]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };
  
  const renderTabContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }

    if (!userData) return null;

    switch (activeTab) {
      case "Profile":
        return <EditProfileForm userData={userData} />;
      case "Vehicles":
        return <div className="p-4 text-center text-muted-foreground">Vehicles management coming soon.</div>;
      case "DOT":
        return <div className="p-4 text-center text-muted-foreground">DOT information coming soon.</div>;
      case "Driver License":
        return <div className="p-4 text-center text-muted-foreground">Driver License details coming soon.</div>;
      case "Warnings":
        return <div className="p-4 text-center text-muted-foreground">Warnings history coming soon.</div>;
      case "Especial Mentions":
        return <div className="p-4 text-center text-muted-foreground">Special Mentions coming soon.</div>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 bg-background/80 backdrop-blur-sm border-b p-4 z-10">
        <div className="container mx-auto flex items-center">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-lg font-semibold">Settings</h1>
        </div>
      </header>
      
      <HorizontalTabBar labels={profileTabLabels} activeTab={activeTab} onTabClick={handleTabClick} />
      
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <h2 className="text-2xl font-bold mb-6">Profile</h2>
        {renderTabContent()}
      </main>
    </div>
  );
}