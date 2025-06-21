"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import type { UserData } from "@/types";
import { Button } from "@/components/ui/button";
import ProfileHeader from "@/components/profile/profile-header";
import ProfileInfo from "@/components/profile/profile-info";
import ProfileStats from "@/components/profile/profile-stats";
import ActivityChart from "@/components/profile/activity-chart";
import { Separator } from "@/components/ui/separator";

// Mock data for display purposes
const mockProfileData = {
  // username will be generated from the name
  contributions: 10,
  followers: 0,
  following: 11,
  joinedDate: "2025-05-08",
  lastActive: "3d ago",
  // 26 weeks * 7 days = 182 days of random activity data
  activityData: Array.from({ length: 182 }, () => Math.floor(Math.random() * 5)),
};

export default function ProfilePage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem("userData");
    if (storedData) {
      try {
        const parsedData: UserData = JSON.parse(storedData);
        // Ensure position exists for the component
        if (!parsedData.Position) {
            parsedData.Position = "Field Worker"; // Default or placeholder
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return null; // or a proper error message
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 pb-20">
      {/* Header Bar */}
      <header className="sticky top-0 bg-white border-b border-gray-200 p-4 z-10">
          <div className="container mx-auto flex items-center">
            <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
                <ArrowLeft className="h-6 w-6" />
            </Button>
            {/* The title can be added here if needed, like "Profile" */}
          </div>
      </header>

      {/* Profile Content */}
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <ProfileHeader
            name={userData.Name}
            position={userData.Position || "Computer Engineer"}
          />

          <ProfileInfo
            lastActive={mockProfileData.lastActive}
            joinedDate={mockProfileData.joinedDate}
          />
          
          <ProfileStats
            contributions={mockProfileData.contributions}
            followers={mockProfileData.followers}
            following={mockProfileData.following}
          />
          
          <Separator />

          <div>
            <h2 className="text-xl font-bold mb-4">Activity</h2>
            <ActivityChart data={mockProfileData.activityData} />
          </div>

        </div>
      </main>
    </div>
  );
}