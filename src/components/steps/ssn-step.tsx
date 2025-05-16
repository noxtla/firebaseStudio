
"use client";

import type { FC, ChangeEvent } from 'react';
// import { Button } from '@/components/ui/button'; // No longer needed here
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card'; // Removed CardFooter
import type { FormData } from '@/types';
// import { ArrowLeft, ArrowRight } from 'lucide-react'; // No longer needed here

interface SsnStepProps {
  formData: Pick<FormData, 'ssnLast4'>;
  onInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  // onNextStep: () => void; // Removed
  // onPrevStep: () => void; // Removed
}

const SsnStep: FC<SsnStepProps> = ({ formData, onInputChange }) => {
  // const canProceed = formData.ssnLast4.length === 4 && /^\d{4}$/.test(formData.ssnLast4); // Logic moved to MultiStepForm

  return (
    <Card className="w-full border-none shadow-none">
      <CardContent className="space-y-4 pt-6">
        <div className="space-y-2">
          <Label htmlFor="ssnLast4">Last 4 Digits of SSN</Label>
          <Input
            id="ssnLast4"
            name="ssnLast4"
            type="password" // Changed from text to password for masking
            inputMode="numeric"
            value={formData.ssnLast4}
            onChange={onInputChange}
            placeholder="••••"
            maxLength={4}
            minLength={4}
            pattern="\d{4}"
            required
            className="text-lg p-3 tracking-widest" // tracking-widest for better •••• appearance
          />
        </div>
      </CardContent>
      {/* CardFooter removed */}
    </Card>
  );
};

export default SsnStep;
