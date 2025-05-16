
"use client";

import type { FC, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card'; // Removed CardHeader, CardDescription
import type { FormData } from '@/types';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface PhoneNumberStepProps {
  formData: Pick<FormData, 'phoneNumber'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onNextStep: () => void;
  onPrevStep: () => void;
}

const PhoneNumberStep: FC<PhoneNumberStepProps> = ({ formData, onInputChange, onNextStep, onPrevStep }) => {
  const canProceed = formData.phoneNumber.replace(/\D/g, '').length === 10; // Stricter validation for 10 digits

  return (
    <Card className="w-full shadow-xl">
      {/* CardHeader removed, title is now global */}
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            value={formData.phoneNumber}
            onChange={onInputChange}
            placeholder="(555) 123-4567"
            maxLength={14} // For formatting like (XXX) XXX-XXXX
            autoComplete="tel"
            required
            className="text-lg p-3" // border-primary focus:ring-primary applied via globals.css --input
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="ghost" onClick={onPrevStep} aria-label="Go to previous step">
          <ArrowLeft className="mr-2 h-4 w-4" /> Previous
        </Button>
        <Button onClick={onNextStep} disabled={!canProceed} aria-label="Go to next step">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PhoneNumberStep;
