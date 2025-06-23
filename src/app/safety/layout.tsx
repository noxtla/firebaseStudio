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
      {/* The AppHeader is now global and has been removed from this layout */}
      <main className="flex-grow container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}