
import AppHeader from '@/components/app-header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Arborist Safety Guide',
  description: 'Interactive safety modules for arborists.',
};

export default function SafetyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="w-full max-w-4xl mx-auto pt-6 sm:pt-8 md:pt-12 px-4">
        <AppHeader className="my-4 sm:my-6" />
      </div>
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
