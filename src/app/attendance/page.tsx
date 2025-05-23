
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AttendanceForm from '@/components/attendance-form';
import type { UserData } from '@/types';
import AppHeader from '@/components/app-header';
import { Loader2 } from 'lucide-react';
import { Toaster } from "@/components/ui/toaster";


export default function AttendancePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
      try {
        const parsedData = JSON.parse(storedUserData);
        setUserData(parsedData);
      } catch (error) {
        console.error("Failed to parse user data from session storage", error);
        // Optionally redirect or show error
        router.replace('/'); // Redirect to login if data is corrupted
      }
    } else {
      // No user data, redirect to login
      router.replace('/');
    }
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center p-4">
        <AppHeader className="mb-8" />
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading user data...</p>
      </div>
    );
  }

  if (!userData) {
    // This case should ideally be handled by the redirect in useEffect,
    // but as a fallback:
    return (
      <div className="flex flex-col min-h-screen bg-background items-center justify-center p-4">
        <AppHeader className="mb-8" />
        <p className="text-destructive">User data not found. Please log in again.</p>
        {/* Optionally add a button to go to login */}
      </div>
    );
  }

  return (
    <>
      <Toaster />
      <AttendanceForm initialUserData={userData} />
    </>
  );
}
