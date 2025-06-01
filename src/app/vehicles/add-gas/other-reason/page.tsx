
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { ChevronLeft, HelpCircle, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from '@/components/ui/toaster';


export default function OtherGasReasonPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [reason, setReason] = useState<string>("");
  const [customExplanation, setCustomExplanation] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false); // Added loading state

  const handleSubmit = async () => {
    if (!reason) {
      toast({
        variant: "destructive",
        title: "No Reason Selected",
        description: "Please select a reason before submitting.",
      });
      return;
    }
    if (reason === "Other Equipment (Specify)" && !customExplanation.trim()) {
      toast({
        variant: "destructive",
        title: "Explanation Required",
        description: "Please provide details for 'Other Equipment'.",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate delay

    console.log("Selected 'Other' Gas Reason:", reason);
    console.log("Custom Explanation:", customExplanation);
    toast({
      title: "Reason Logged (Placeholder)",
      description: `Selected reason: ${reason}. Explanation: ${customExplanation || 'N/A'}. This would normally be submitted.`,
    });
    
    router.back(); 
    // setIsSubmitting(false); // Component unmounts
  };

  const canSubmit = reason && !(reason === "Other Equipment (Specify)" && !customExplanation.trim());

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <Toaster />
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2" disabled={isSubmitting}>
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <AppHeader className="flex-grow" />
      </div>

      <div className="flex-grow flex flex-col items-center">
        <Card className="w-full max-w-lg shadow-lg rounded-lg border-none">
          <CardHeader className="items-center text-center">
            <HelpCircle className="h-12 w-12 text-primary mb-2" />
            <CardTitle className="text-2xl font-heading-style">
              Specify Other Gas Reason
            </CardTitle>
            <CardDescription>Please select why you are adding gas to 'Other' and provide details if necessary.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <Label htmlFor="otherReasonSelect" className="text-muted-foreground">Reason for 'Other' Gas</Label>
              <Select value={reason} onValueChange={setReason} disabled={isSubmitting}>
                <SelectTrigger id="otherReasonSelect" className="w-full text-base">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Portable Generator">Portable Generator (e.g., for on-site power)</SelectItem>
                  <SelectItem value="Chainsaw">Chainsaw (e.g., fuel for handheld saws)</SelectItem>
                  <SelectItem value="Leaf Blower / Trimmer">Leaf Blower / Trimmer (e.g., for small engine equipment)</SelectItem>
                  <SelectItem value="Water Pump">Water Pump (e.g., for dewatering or irrigation)</SelectItem>
                  <SelectItem value="Spill / Contamination">Spill / Contamination (e.g., fuel used for cleanup or lost)</SelectItem>
                  <SelectItem value="Other Equipment (Specify)">Other Equipment (Specify details if not listed)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customExplanation" className="text-muted-foreground">
                Additional Details / Explanation
              </Label>
              <Textarea
                id="customExplanation"
                placeholder="Provide specific details or explanation here..."
                value={customExplanation}
                onChange={(e) => setCustomExplanation(e.target.value)}
                className="text-base min-h-[100px]"
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end pt-6">
            <Button size="lg" onClick={handleSubmit} disabled={isSubmitting || !canSubmit}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Submitting..." : "Submit Reason"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
