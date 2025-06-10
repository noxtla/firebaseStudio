import React, { FC } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SsnStepProps {
  formData: { ssnLast4: string };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSsnValid: boolean;
}

const SsnStep: FC<SsnStepProps> = ({ formData, onInputChange, isSsnValid }) => {
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
