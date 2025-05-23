import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  className?: string;
}

const AppHeader: FC<AppHeaderProps> = ({ className }) => {
  return (
    <div className={cn("text-center", className)}>
      <h1
        className="font-extrabold uppercase" // Removed Tailwind text size classes
        style={{
          color: 'hsl(var(--primary))',
          fontFamily: 'var(--font-body)', // Using Open Sans (body font) with extrabold weight
          // Responsive font size: min 2rem, preferred 8vw, max 4.5rem
          fontSize: 'clamp(2rem, 8vw, 4.5rem)',
        }}
      >
        TreeService
      </h1>
    </div>
  );
};

export default AppHeader;
