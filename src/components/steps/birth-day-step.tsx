
"use client";

import type { FC, ChangeEvent } from 'react';
// import { Button } from '@/components/ui/button'; // No longer needed here
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardFooter
import type { FormData } from '@/types';
// import { ArrowLeft, ArrowRight } from 'lucide-react'; // No longer needed here

interface BirthDayStepProps {
  formData: Pick<FormData, 'birthDay'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  // onNextStep: () => void; // Removed
  // onPrevStep: () => void; // Removed
}

const BirthDayStep: FC<BirthDayStepProps> = ({ formData, onInputChange }) => {
  // const day = parseInt(formData.birthDay, 10); // Logic moved to MultiStepForm
  // const canProceed = !isNaN(day) && day >= 1 && day <= 31; // Logic moved to MultiStepForm

  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="birthDay">Day of Birth (e.g., 5, 17, 31)</Label>
          <Input
            id="birthDay"
            name="birthDay"
            type="number"
            inputMode="numeric"
            value={formData.birthDay}
            onChange={onInputChange}
            placeholder="DD"
            min="1"
            max="31"
            required
            className="text-lg p-3"
          />
        </div>
      </CardContent>
      {/* CardFooter removed */}
    </Card>
  );
};

export default BirthDayStep;
