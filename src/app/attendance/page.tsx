
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceForm from '@/components/attendance-form';
import type { UserData } from '@/types';
import AppHeader from '@/components/app-header';
import { Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/toaster';
import { Button } from '@/components/ui/button'; // Added

export default function AttendancePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserData = sessionStorage.getItem('userData');
      if (storedUserData) {
        try {
          setUserData(JSON.parse(storedUserData));
        } catch (error) {
          console.error("Failed to parse user data from session storage", error);
          sessionStorage.removeItem('userData'); // Clear corrupted data
          router.replace('/'); // Redirect to login if data is corrupted
        }
      } else {
        // No user data found, redirect to login
        router.replace('/');
      }
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading attendance data...</p>
      </div>
    );
  }

  if (!userData) {
    // This case should ideally be handled by the redirect in useEffect,
    // but as a fallback:
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
    