
"use client";

import type { FC, ChangeEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import type { FormData } from '@/types';

interface PhoneNumberStepProps {
  formData: Pick<FormData, 'phoneNumber'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  rawApiResponse: string | null; // New prop for raw API response
}

const PhoneNumberStep: FC<PhoneNumberStepProps> = ({ formData, onInputChange, rawApiResponse }) => {
  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            name="phoneNumber"
            type="text" 
            inputMode="numeric" 
            pattern="[0-9]*"
            value={formData.phoneNumber}
            onChange={onInputChange}
            placeholder="(555) 123-4567"
            maxLength={14} 
            autoComplete="tel" 
            required
            className="text-base sm:text-lg p-2 sm:p-3"
          />
        </div>
        {rawApiResponse && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <h4 className="text-sm font-semibold mb-1 text-muted-foreground">Raw API Response (for debugging):</h4>
            <pre className="text-xs whitespace-pre-wrap break-all bg-background p-2 rounded border text-foreground">
              {rawApiResponse}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PhoneNumberStep;
