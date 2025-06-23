"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, LogOut } from "lucide-react"; // Added LogOut icon

import type { UserData } from "@/types";
import { Button } from "@/components/ui/button";
import ProfileHeader from "@/components/profile/profile-header";
import ProfileInfo from "@/components/profile/profile-info";
import ProfileStats from "@/components/profile/profile-stats";
import ActivityChart from "@/components/profile/activity-chart";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast"; // Added useToast hook

const mockProfileData = {
  contributions: 10,
  followers: 0,
  following: 11,
  joinedDate: "2025-05-08",
  lastActive: "3d ago",
  activityData: Array.from({ length: 182 }, () => Math.floor(Math.random() * 5)),
};

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast(); // Initialized toast
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedData = sessionStorage.getItem("userData");
    if (storedData) {
      try {
        const parsedData: UserData = JSON.parse(storedData);
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

  // --- NEW FUNCTION: Handles the sign-off logic ---
  const handleSignOut = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
    toast({
      title: "Signed Out",
      description: "You have been successfully signed out.",
    });
    router.push('/');
  };
  // --- END NEW FUNCTION ---

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userData) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white text-gray-800 pb-20">
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-6 w-6" />
        </Button>

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

          {/* --- NEW BUTTON: Added at the bottom of the profile content --- */}
          <div className="pt-6">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Off
            </Button>
          </div>
          {/* --- END NEW BUTTON --- */}
        </div>
      </main>
    </div>
  );
}