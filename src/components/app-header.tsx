import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface AppHeaderProps {
  className?: string;
}

const AppHeader: FC<AppHeaderProps> = ({ className }) => {
  return (
    <div className={cn("text-center", className)}>
      <h1
        className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase"
        style={{ color: 'hsl(var(--primary))', fontFamily: 'var(--font-body)' }} // Use Open Sans (body font) for ASPLUNDH
      >
        ASPLUNDH
      </h1>
    </div>
  );
};

export default AppHeader;
