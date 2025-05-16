"use client";

import type { FC, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormData } from '@/types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface BirthDayStepProps {
  formData: Pick<FormData, 'birthDay'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

const BirthDayStep: FC<BirthDayStepProps> = ({ formData, onInputChange, onNextStep, onPrevStep }) => {
  const day = parseInt(formData.birthDay, 10);
  const canProceed = !isNaN(day) && day >= 1 && day <= 31;

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Day of Birth</CardTitle>
        <CardDescription className="text-center">
          Please enter the day of the month you were born (e.g., 5, 17, 31).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="birthDay">Day of Birth</Label>
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
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevStep} aria-label="Go to previous step">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
        <Button onClick={onNextStep} disabled={!canProceed} aria-label="Go to next step">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default BirthDayStep;
