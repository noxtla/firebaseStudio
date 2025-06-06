
import AppHeader from '@/components/app-header';
import { Toaster } from '@/components/ui/toaster';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Job Briefing',
  description: 'Daily Job Safety Briefing Form',
};

export default function JobBriefingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Toaster />
      <div className="w-full max-w-4xl mx-auto pt-6 sm:pt-8 md:pt-12 px-4">
        <AppHeader className="my-4 sm:my-6" />
      </div>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
