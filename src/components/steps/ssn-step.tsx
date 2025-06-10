
"use client";

import type { FC, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { FormData } from '@/types';

interface SsnStepProps {
  formData: Pick<FormData, 'ssnLast4'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const SsnStep: FC<SsnStepProps> = ({ formData, onInputChange }) => {
  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="ssnLast4">Last 4 Digits of SSN</Label>
          <Input
            id="ssnLast4"
            name="ssnLast4"
            type="password" 
            inputMode="numeric"
            value={formData.ssnLast4}
            onChange={onInputChange}
            placeholder="••••"
            maxLength={4}
            minLength={4}
            pattern="\d{4}"
            required
            className="text-base sm:text-lg p-2 sm:p-3 tracking-widest"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SsnStep;
