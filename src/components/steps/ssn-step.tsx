
"use client";

import type { FC, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter } from '@/components/ui/card'; // Removed CardHeader, CardDescription
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
      {/* CardHeader removed, title is now global */}
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
            className="text-lg p-3 tracking-widest" // border-primary focus:ring-primary applied via globals.css --input
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

export default SsnStep;
