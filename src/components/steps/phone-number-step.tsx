
"use client";

import type { FC, ChangeEvent } from 'react';
// import { Button } from '@/components/ui/button'; // No longer needed here
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardFooter
import type { FormData } from '@/types';
// import { ArrowLeft, ArrowRight } from 'lucide-react'; // No longer needed here

interface PhoneNumberStepProps {
  formData: Pick<FormData, 'phoneNumber'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  // onNextStep: () => void; // Removed
  // onPrevStep: () => void; // Removed
}

const PhoneNumberStep: FC<PhoneNumberStepProps> = ({ formData, onInputChange }) => {
  // const canProceed = formData.phoneNumber.replace(/\D/g, '').length === 10; // Logic moved to MultiStepForm

  return (
    <Card className="w-full border-none shadow-none">
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
            maxLength={14}
            autoComplete="tel"
            required
            className="text-lg p-3"
          />
        </div>
      </CardContent>
      {/* CardFooter removed */}
    </Card>
  );
};

export default PhoneNumberStep;
