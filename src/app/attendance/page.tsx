"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceForm from '@/components/attendance-form';
import type { UserData } from '@/types';
import AppHeader from '@/components/app-header';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button';
import { useToast } from "@/hooks/use-toast";

export default function AttendancePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const fetchAttendanceDetails = async (currentUser: UserData) => {
      try {
        const response = await fetch('https://noxtla.app.n8n.cloud/webhook/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phoneNumber: currentUser.phoneNumber,
            action: 'attendance' // MODIFIED as requested
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user details for attendance.');
        }

        const details = await response.json();
        
        if (details && details[0]?.SSN && details[0]?.birth_date) {
            const fullUserData: UserData = {
                ...currentUser,
                SSN: details[0].SSN,
                birth_date: details[0].birth_date,
            };
            
            sessionStorage.setItem('userData', JSON.stringify(fullUserData));
            setUserData(fullUserData);
        } else {
             throw new Error('Incomplete user details received from server.');
        }

      } catch (error: any) {
        console.error("Error fetching attendance details:", error);
        toast({
          title: "Error",
          description: "Could not load required attendance data. Please try again.",
          variant: "destructive",
        });
        router.replace('/main-menu');
      } finally {
        setIsLoading(false);
      }
    };

    if (typeof window !== 'undefined') {
      const storedUserData = sessionStorage.getItem('userData');
      if (storedUserData) {
        try {
          const parsedUserData: UserData = JSON.parse(storedUserData);
          
          if (!parsedUserData.SSN) {
            fetchAttendanceDetails(parsedUserData);
          } else {
            setUserData(parsedUserData);
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Failed to parse user data", error);
          router.replace('/');
        }
      } else {
        router.replace('/');
      }
    }
  }, [router, toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading attendance data...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Toaster/>
        <AppHeader className="my-8" />
        <p className="text-destructive text-lg">User data not found. Please log in again.</p>
        <Button onClick={() => router.push('/')} className="mt-4">Go to Login</Button>
      </div>
    );
  }
  
  return <AttendanceForm initialUserData={userData} />;
}
The following snippets may be helpful:


## Next steps

* Explore the [Firebase Studio documentation](/docs/studio).
* [Get started with Firebase Studio](https://studio.firebase.google.com/).

Send feedback

please ignore this.