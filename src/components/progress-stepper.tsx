
"use client";

import type { FC } from 'react';
import React from 'react'; // Import React for React.Fragment
import { cn } from '@/lib/utils';

interface ProgressStepperProps {
  currentStepIndex: number; // This will be 0 for "Phone", 1 for "SSN", etc.
  steps: string[];
  className?: string;
}

const ProgressStepper: FC<ProgressStepperProps> = ({ currentStepIndex, steps, className }) => {
  return (
    <div className={cn("flex w-full items-center", className)}>
      {steps.map((label, index) => {
        const isActive = index === currentStepIndex;
        const isCompleted = index < currentStepIndex;

        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center text-center" style={{ minWidth: '60px' }}> {/* Container for circle + label */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-colors duration-300",
                  isActive
                    ? "bg-primary border-primary text-primary-foreground"
                    : isCompleted
                    ? "bg-primary border-primary text-primary-foreground"
                    : "bg-card border-border text-foreground" // Default state for white background
                )}
              >
                {index + 1}
              </div>
              <p
                className={cn(
                  "mt-1 text-xs w-full px-1 break-words transition-colors duration-300", // Ensure text wraps and has some padding
                  isActive ? "text-primary font-semibold" : "text-muted-foreground"
                )}
                style={{ minHeight: '2.5em' }} // Ensure consistent height for labels
              >
                {label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div className={cn(
                "flex-grow h-0.5 transition-colors duration-300",
                // Line is active if the step it comes from (current `index`) is completed
                isCompleted ? "bg-primary" : "bg-border"
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default ProgressStepper;
