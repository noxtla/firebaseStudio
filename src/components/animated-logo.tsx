import type { FC } from 'react';

interface AnimatedLogoProps {
  className?: string;
}

const AnimatedLogo: FC<AnimatedLogoProps> = ({ className = "" }) => {
  return (
    <div className={`text-center animate-logo-reveal ${className}`}>
      <h1 className="text-5xl font-bold" style={{ color: 'hsl(var(--primary))' }}>
        Asplundh
      </h1>
    </div>
  );
};

export default AnimatedLogo;
