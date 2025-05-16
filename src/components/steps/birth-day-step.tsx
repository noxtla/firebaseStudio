
"use client";

import type { FC, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { FormData } from '@/types';

interface BirthDayStepProps {
  formData: Pick<FormData, 'birthDay'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const BirthDayStep: FC<BirthDayStepProps> = ({ formData, onInputChange }) => {
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
            maxLength={2} // Added maxLength
            required
            className="text-lg p-3"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthDayStep;
