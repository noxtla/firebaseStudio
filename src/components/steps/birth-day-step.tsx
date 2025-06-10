
"use client";

import type { FC, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import type { FormData } from '@/types';
import { useState, useEffect, useCallback } from 'react'; // Import useCallback

interface BirthDayStepProps {
  formData: Pick<FormData, 'birthDay'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const getMonthName = (monthNumber: number): string => {
  const date = new Date();
  date.setMonth(monthNumber - 1);
  return date.toLocaleString('en-US', { month: 'long' });
};

const getMonthIndex = (monthName: string): number | null => {
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const index = monthNames.findIndex(name => name.toLowerCase() === monthName.toLowerCase());
  return index !== -1 ? index : null;
};


const BirthDayStep: FC<BirthDayStepProps> = ({ formData, onInputChange, onValidationChange }) => {
  const [error, setError] = useState('');

  const validateDay = useCallback((dayValue: string): string => {
    // Default values to avoid NaN issues
    let displayMonth = "September";
    let displayYear = "1996";

    //If you want the validation to happen based on the user's actual birthdate, you would need to pass the actual birthdate
    // from the initialUserData to this component and use it here.
    // For this example, I am keeping the default values

    if (dayValue.length === 0) {
        return "";
    }

    const day = parseInt(dayValue, 10);
    const year = parseInt(displayYear, 10);
    const monthIndex = getMonthIndex(displayMonth);

    if (isNaN(day) || day < 1 || day > 31) {
       return "Please enter a valid day (1-31).";
    } else if (monthIndex === null || isNaN(year)) {
         return "Could not determine month or year for validation.";
    }
    else {
      const date = new Date(year, monthIndex, day);
      if (date.getDate() === day && date.getMonth() === monthIndex && date.getFullYear() === year) {
        return "";
      } else {
        return `Day ${day} is not valid for ${displayMonth} ${displayYear}.`;
      }
    }
  }, []);

  const handleDayInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { value, name } = e.target;

    if (name === 'birthDay') {
      // For local validation, still use a numeric-only version of the value
      const numericValueForValidation = value.replace(/\D/g, '');
      const validationError = validateDay(numericValueForValidation);
      setError(validationError);

      if (onValidationChange) {
        onValidationChange(validationError === '' && numericValueForValidation.length > 0);
      }
      // Pass the original event (with potentially non-numeric characters) to the parent.
      // The parent's onInputChange will handle cleaning (e.g., .replace(/\D/g, '')).
      onInputChange(e);
    } else {
       onInputChange(e);
    }
  };

  useEffect(() => {
    // formData.birthDay from props should already be cleaned by the parent
    const validationError = validateDay(formData.birthDay);
    setError(validationError);
    if (onValidationChange) {
        onValidationChange(validationError === '' && formData.birthDay.length > 0);
    }
  }, [formData.birthDay, onValidationChange, validateDay]);

  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="flex items-baseline justify-center gap-x-2 text-foreground text-sm sm:text-base" aria-live="polite">
            <span>Your birthday is</span>
            <div className="inline-block w-16 align-baseline">
              <Input
                id="birthDay"
                name="birthDay"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={formData.birthDay}
                onChange={handleDayInputChange}
                placeholder="DD"
                maxLength={2}
                required
                className="w-full text-center text-sm sm:text-base"
                aria-label="Day of your birth (enter two digits)"
              />
            </div>
            <span>September 1996.</span>
          </div>
          {error && (
             <p className="text-red-500 text-sm mt-1">{error}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthDayStep;
