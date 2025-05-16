"use client";

import type { FC } from 'react';
import { cn } from '@/lib/utils';

interface ProgressStepperProps {
  currentStepIndex: number;
  steps: string[];
  className?: string;
}

const ProgressStepper: FC<ProgressStepperProps> = ({ currentStepIndex, steps, className }) => {
  return (
    <div className={cn("flex justify-between items-start w-full", className)}>
      {steps.map((label, index) => {
        const isActive = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;

        return (
          <div key={label} className="flex flex-col items-center flex-1 group">
            <div className="relative flex flex-col items-center">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2",
                  isActive
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-primary border-primary text-primary-foreground" // Completed also styled as active per common patterns
                    : "bg-muted border-muted-foreground text-muted-foreground"
                )}
              >
                {index + 1}
              </div>
              <p
                className={cn(
                  "mt-2 text-xs text-center",
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                )}
              >
                {label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "absolute top-4 left-1/2 w-full h-0.5 transform -translate-y-1/2 -z-10",
                "group-first:w-1/2 group-first:left-auto group-first:right-0", // Adjust first line to start from center of circle
                "group-last:w-1/2 group-last:left-0", // Adjust last line to end at center of circle
                isCompleted || isActive ? "bg-primary" : "bg-muted-foreground" // Line color
              )} style={{
                // This logic is a bit tricky with flex-1. True connectors are hard without absolute positioning & manual widths.
                // This is a simplified visual line that sits behind circles. A more robust solution might use :before/:after or SVG.
                // For now, let's rely on the circles being prominent.
                // The provided image doesn't have explicit connector lines between circles, so we can omit complex line logic.
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ProgressStepper;
