
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
          <p className="text-lg font-semibold text-center text-primary mb-3">
            September 1996
          </p>
          <Label htmlFor="birthDay">Day of Birth</Label>
          <Input
            id="birthDay"
            name="birthDay"
            type="text"
            inputMode="numeric"
            value={formData.birthDay}
            onChange={onInputChange}
            placeholder="DD"
            maxLength={2}
            required
            className="text-lg p-3"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default BirthDayStep;
