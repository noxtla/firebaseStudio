import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  className?: string;
}

const AppHeader: FC<AppHeaderProps> = ({ className }) => {
  return (
    <div className={cn("text-center", className)}>
      <h1
        className="font-black uppercase" // Use Tailwind's font-black for Lato 900 weight
        style={{
          color: 'hsl(var(--primary))', // Use primary color for the header
          fontFamily: 'var(--font-heading)', // Use Lato (heading font)
          // Responsive font size: min 2rem, preferred 8vw, max 4.5rem
          fontSize: 'clamp(2rem, 8vw, 4.5rem)',
        }}
      >
        Tree Services
      </h1>
    </div>
  );
};

export default AppHeader;
