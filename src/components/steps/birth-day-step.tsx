
"use client";

import type { FC, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { FormData } from '@/types';

interface BirthDayStepProps {
  formData: Pick<FormData, 'birthDay'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const BirthDayStep: FC<BirthDayStepProps> = ({ formData, onInputChange }) => {
  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="pt-6"> {/* Default pt-6 is 24px */}
        <div className="flex flex-col items-center space-y-3 text-center"> {/* Centers the content block */}
          
          {/* The instruction sentence wrapping the input concept */}
          <div className="flex items-baseline justify-center flex-wrap gap-x-2 text-foreground text-base sm:text-lg" aria-live="polite">
            <span>Your birthday is</span>
            <div className="inline-block w-20 align-baseline"> {/* Container for the input */}
              <Input
                id="birthDay"
                name="birthDay"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.birthDay}
                onChange={onInputChange}
                placeholder="DD"
                maxLength={2}
                required
                // Input styling: full width of its small container, text centered, and text-lg.
                // The default Input component handles its own padding and height (h-10).
                className="w-full text-center text-lg" 
                aria-label="Day of your birth (enter two digits)" // Enhanced aria-label
              />
            </div>
            <span>September 1996.</span>
          </div>
          
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthDayStep;
