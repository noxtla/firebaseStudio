"use client";

import type { FC, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormData } from '@/types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface SsnStepProps {
  formData: Pick<FormData, 'ssnLast4'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

const SsnStep: FC<SsnStepProps> = ({ formData, onInputChange, onNextStep, onPrevStep }) => {
  const canProceed = formData.ssnLast4.length === 4 && /^\d{4}$/.test(formData.ssnLast4);

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Social Security Number</CardTitle>
        <CardDescription className="text-center">
          Enter the last 4 digits of your SSN.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="ssnLast4">Last 4 Digits of SSN</Label>
          <Input
            id="ssnLast4"
            name="ssnLast4"
            type="password" // Mask input
            inputMode="numeric"
            value={formData.ssnLast4}
            onChange={onInputChange}
            placeholder="XXXX"
            maxLength={4}
            minLength={4}
            pattern="\d{4}"
            required
            className="text-lg p-3 tracking-widest"
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

export default SsnStep;
