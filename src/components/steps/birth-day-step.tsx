
"use client";

import type { FC, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { FormData, UserData } from '@/types';

interface BirthDayStepProps {
  formData: Pick<FormData, 'birthDay'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  userData: UserData | null;
}

const getMonthName = (monthNumber: number): string => {
  const date = new Date();
  date.setMonth(monthNumber - 1); // Month is 0-indexed in JavaScript Date
  return date.toLocaleString('en-US', { month: 'long' });
};

const BirthDayStep: FC<BirthDayStepProps> = ({ formData, onInputChange, userData }) => {
  let displayMonth = "September";
  let displayYear = "1996";

  if (userData && userData.dataBirth) {
    try {
      const parts = userData.dataBirth.split('-'); // YYYY-MM-DD
      if (parts.length === 3) {
        displayYear = parts[0];
        displayMonth = getMonthName(parseInt(parts[1], 10));
      }
    } catch (e) {
      console.error("Error parsing userData.dataBirth:", e);
      // Fallback to defaults if parsing fails
    }
  }

  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex items-baseline justify-center flex-wrap gap-x-2 text-foreground text-base sm:text-lg" aria-live="polite">
            <span>Your birthday is</span>
            <div className="inline-block w-20 align-baseline">
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
                className="w-full text-center text-lg"
                aria-label="Day of your birth (enter two digits)"
              />
            </div>
            <span>{displayMonth} {displayYear}.</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthDayStep;
