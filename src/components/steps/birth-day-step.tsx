"use client";

import type { FC, ChangeEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import type { FormData } from '@/types';
import { useState, useEffect, useCallback } from 'react'; // Import useCallback
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const currentYear = new Date().getFullYear();

interface BirthDayStepProps {
  formData: { birthMonth: string; birthDay: string; birthYear: string };
  onInputChange: (e: { name: keyof Pick<FormData, 'birthMonth' | 'birthDay' | 'birthYear'>; value: string }) => void;
  onValidationChange?: (isValid: boolean) => void;
}

const BirthDayStep: FC<BirthDayStepProps> = ({ formData, onInputChange, onValidationChange }) => {  
  const [combinedError, setCombinedError] = useState('');
  const [dayOptions, setDayOptions] = useState<string[]>([]);

  const validateDate = useCallback((month: string, day: string, year: string): { isValid: boolean; error: string } => {
    // Check if all fields are filled
    if (!month || !day || !year) {
      return { isValid: false, error: '' }; // No error message if incomplete
    }

    const monthInt = parseInt(month, 10);
    const dayInt = parseInt(day, 10);
    const yearInt = parseInt(year, 10);

    // Basic number and range validation
    if (isNaN(monthInt) || monthInt < 1 || monthInt > 12) {
      return { isValid: false, error: "Invalid month." };
    }
    if (isNaN(dayInt) || dayInt < 1 || dayInt > 31) { 
      return { isValid: false, error: "Invalid day." };
    }
    if (isNaN(yearInt) || yearInt < 1900 || yearInt > currentYear) { // Basic year range
        return { isValid: false, error: `Invalid year. Must be between 1900 and ${currentYear}.` };
    }

    // Validate day based on month and leap year using Date object behavior
    const date = new Date(yearInt, monthInt - 1, dayInt);
    if (date.getMonth() !== monthInt - 1 || date.getDate() !== dayInt || date.getFullYear() !== yearInt) {
      return { isValid: false, error: "Invalid date for the selected month and year." };
    }

    // Age restriction (at least 21 years old)
    const today = new Date();
    const birthDate = new Date(yearInt, monthInt - 1, dayInt);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    if (age < 21) {
      return { isValid: false, error: "You must be at least 21 years old." };
    }

    return { isValid: true, error: "" };
  }, []);

  const handleSelectChange = (name: keyof Pick<FormData, 'birthMonth' | 'birthDay' | 'birthYear'>, value: string) => {
    onInputChange({ name, value });
  };


  const handleBlur = useCallback(() => {
    // Validate on blur of any field
    const { isValid, error } = validateDate(formData.birthMonth, formData.birthDay, formData.birthYear);
    setCombinedError(error);

    // Only report overall validation status when all fields have content
    const allFieldsFilled = formData.birthMonth.length > 0 && formData.birthDay.length > 0 && formData.birthYear.length > 0;
    if (onValidationChange) {
        onValidationChange(allFieldsFilled && isValid);
    }
  }, [formData.birthMonth, formData.birthDay, formData.birthYear, onValidationChange, validateDate]);

  // Effect to update validation state whenever form data changes
  useEffect(() => {
    // Check overall validity only if all fields are filled, but always update the error message
    const { isValid, error } = validateDate(formData.birthMonth, formData.birthDay, formData.birthYear);
    setCombinedError(error); // Update combined error regardless of completeness

    // Report validation status to parent only when all fields are filled
    const allFieldsFilled = formData.birthMonth.length > 0 && formData.birthDay.length > 0 && formData.birthYear.length > 0;
    if (onValidationChange && allFieldsFilled) { // Only validate if all fields are filled
        onValidationChange(allFieldsFilled && isValid);
    }
  }, [formData.birthMonth, formData.birthDay, formData.birthYear, onValidationChange, validateDate]);

  // Effect to update day options based on selected month and year
  useEffect(() => {
    const monthInt = parseInt(formData.birthMonth, 10);
    const yearInt = parseInt(formData.birthYear, 10);

    if (!isNaN(monthInt) && !isNaN(yearInt)) {
      // Get the number of days in the selected month and year
      const daysInMonth = new Date(yearInt, monthInt, 0).getDate();
      const newDayOptions = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString().padStart(2, '0'));
      setDayOptions(newDayOptions);

      // If the currently selected day is greater than the new number of days, reset the day
      if (parseInt(formData.birthDay, 10) > daysInMonth) {
        onInputChange({ name: 'birthDay', value: '' });
      }

    } else if (!isNaN(monthInt)) {
         // If only month is selected, default to 31 days (will be validated later with year)
         const newDayOptions = Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, '0'));
         setDayOptions(newDayOptions);
    } else {
        setDayOptions([]);
        if (formData.birthDay.length > 0) {
             onInputChange({ name: 'birthDay', value: '' });
        }
    }
  }, [formData.birthMonth, formData.birthYear, formData.birthDay, onInputChange]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const years = Array.from({ length: currentYear - 1996 + 1 }, (_, i) => (currentYear - i).toString());

  const allFieldsFilled = formData.birthMonth.length > 0 && formData.birthDay.length > 0 && formData.birthYear.length > 0;
  const showCombinedError = combinedError && allFieldsFilled;


  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="flex items-baseline justify-center gap-x-2 text-foreground text-sm sm:text-base" aria-live="polite">
            <span>Your birthday is:</span>
            <div className="inline-block w-14 align-baseline">
               <Select
                id="birthMonth"
                name="birthMonth"
                value={formData.birthMonth}
                onValueChange={(value) => handleSelectChange('birthMonth', value)}
                required
                // className={cn("w-full text-center text-sm sm:text-base", (monthError || combinedError) && "border-red-500")} // Add error class if needed
                aria-label="Month of your birth (enter two digits)"
               >
                 <SelectTrigger className="w-full text-center text-sm sm:text-base">
                    <SelectValue placeholder="MM" />
                 </SelectTrigger>
                 <SelectContent>
                    {monthNames.map((month, index) => (
                        <SelectItem key={index} value={(index + 1).toString().padStart(2, '0')}>
                            {month}
                        </SelectItem>
                    ))}
                 </SelectContent>
               </Select>
            </div>
            <span>/</span>
            <div className="inline-block w-14 align-baseline">
               <Select
                id="birthDay"
                name="birthDay"
                value={formData.birthDay}
                onValueChange={(value) => handleSelectChange('birthDay', value)}
                required
                // className={cn("w-full text-center text-sm sm:text-base", (dayError || combinedError) && "border-red-500")} // Add error class if needed
                aria-label="Day of your birth (enter two digits)"
                placeholder="DD"
               >
                 <SelectTrigger className="w-full text-center text-sm sm:text-base">
                    <SelectValue placeholder="DD" />
                 </SelectTrigger>
                 <SelectContent>
                    {dayOptions.map((day) => (
                        <SelectItem key={day} value={day}>
                            {day}
                        </SelectItem>
                    ))}
                 </SelectContent>
               </Select>
            </div>
             <span>/</span>
            <div className="inline-block w-20 align-baseline">
               <Select
                id="birthYear"
                name="birthYear"
                value={formData.birthYear}
                onValueChange={(value) => handleSelectChange('birthYear', value)}
                required
                // className={cn("w-full text-center text-sm sm:text-base", (yearError || combinedError) && "border-red-500")} // Add error class if needed
                aria-label="Year of your birth (enter four digits)"
                placeholder="YYYY"
               >
                 <SelectTrigger className="w-full text-center text-sm sm:text-base">
                    <SelectValue placeholder="YYYY" />
                 </SelectTrigger>
                 <SelectContent>
                    {years.map((year) => (
                        <SelectItem key={year} value={year}>
                            {year}
                        </SelectItem>
                    ))}
                 </SelectContent>
               </Select>
            </div>
          </div>
          {showCombinedError && ( 
             <p className="text-red-500 text-sm mt-1">{combinedError}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthDayStep;
