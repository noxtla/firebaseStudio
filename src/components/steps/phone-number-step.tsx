"use client";

import type { FC, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { FormData } from '@/types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PhoneNumberStepProps {
  formData: Pick<FormData, 'phoneNumber'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

const PhoneNumberStep: FC<PhoneNumberStepProps> = ({ formData, onInputChange, onNextStep, onPrevStep }) => {
  const canProceed = formData.phoneNumber.trim().length >= 10; // Basic validation

  return (
    <Card className="w-full shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl text-center">Phone Number</CardTitle>
        <CardDescription className="text-center">
          Please enter your 10-digit phone number.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={onInputChange}
            placeholder="e.g., (555) 123-4567"
            maxLength={14} // For formatting like (XXX) XXX-XXXX
            autoComplete="tel"
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

export default PhoneNumberStep;
