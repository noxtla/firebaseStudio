
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useJobBriefingStore } from '../state';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ArrowRight, Info, Clock, Users, User, MapPin, ChevronLeft } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import ProgressStepper from '@/components/progress-stepper'; // Assuming you have or will create this

const step1Schema = z.object({
  date: z.date({ required_error: "Date is required." }),
  time: z.string().min(1, "Time is required."), // Basic validation, can be enhanced for time format
  crewNumber: z.string().min(1, "Crew number is required."),
  crewPhoneNumber: z.string().min(10, "Valid phone number is required.").regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Phone number must be in (XXX) XXX-XXXX format."),
  generalForemanName: z.string().min(1, "General foreman name is required."),
  foremanName: z.string().min(1, "Foreman name is required."),
  workLocation: z.string().min(1, "Work location is required."),
});

type Step1FormData = z.infer<typeof step1Schema>;

const TOTAL_BRIEFING_STEPS = 6; // Adjust as more steps are added
const briefingStepLabels = ["Basic Info", "Emergency", "Tasks", "Performance", "Hazards", "Controls", "Summary"];


export default function JobBriefingStep1Page() {
  const router = useRouter();
  const { formData, setFormData, currentStep, setCurrentStep } = useJobBriefingStore();

  const { control, handleSubmit, formState: { errors }, watch, setValue } = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      date: formData.date ? new Date(formData.date) : undefined,
      time: formData.time,
      crewNumber: formData.crewNumber,
      crewPhoneNumber: formData.crewPhoneNumber,
      generalForemanName: formData.generalForemanName,
      foremanName: formData.foremanName,
      workLocation: formData.workLocation,
    },
  });

  const watchedFields = watch();
  useEffect(() => {
    setFormData(watchedFields);
  }, [watchedFields, setFormData]);
  
  // Format phone number
  const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "crewPhoneNumber") {
      const cleaned = ('' + value).replace(/\D/g, '');
      if (cleaned.length > 10) return;
      const match = cleaned.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
      if (match) {
        let formatted = '';
        if (match[1]) formatted += `(${match[1]}`;
        if (match[2]) formatted += `) ${match[2]}`;
        if (match[3]) formatted += `-${match[3]}`;
        setValue('crewPhoneNumber', formatted.trim(), { shouldValidate: true });
        return;
      }
      setValue('crewPhoneNumber', cleaned, { shouldValidate: true });
    }
  };


  const onSubmit = (data: Step1FormData) => {
    setFormData(data);
    setCurrentStep(2);
    router.push('/job-briefing/step-2'); // Navigate to the next step
  };
  
  const handlePrevious = () => {
    router.push('/main-menu');
  }

  return (
    <div className="w-full">
      <ProgressStepper
        currentStepIndex={currentStep -1} // 0-indexed
        steps={briefingStepLabels.slice(0, TOTAL_BRIEFING_STEPS)} 
        className="mb-8 w-full"
      />
      <Card className="w-full max-w-2xl mx-auto shadow-xl border-none">
        <CardHeader className="items-center text-center bg-primary/10 py-6 rounded-t-lg">
          <Info className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-heading-style text-primary">
            Job Briefing - Step 1
          </CardTitle>
          <CardDescription className="text-muted-foreground">Basic Information</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-6 p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Date */}
              <div className="space-y-2">
                <Label htmlFor="date" className="flex items-center text-foreground">
                  <CalendarIcon className="mr-2 h-4 w-4 text-primary" /> Date
                </Label>
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value && "text-muted-foreground",
                            errors.date && "border-destructive"
                          )}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => field.onChange(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                />
                {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
              </div>

              {/* Time */}
              <div className="space-y-2">
                <Label htmlFor="time" className="flex items-center text-foreground">
                  <Clock className="mr-2 h-4 w-4 text-primary" /> Time
                </Label>
                <Controller
                  name="time"
                  control={control}
                  render={({ field }) => <Input id="time" type="time" {...field} className={cn(errors.time && "border-destructive")} />}
                />
                {errors.time && <p className="text-xs text-destructive">{errors.time.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Crew Number */}
              <div className="space-y-2">
                <Label htmlFor="crewNumber" className="flex items-center text-foreground">
                  <Users className="mr-2 h-4 w-4 text-primary" /> Crew N.º
                </Label>
                <Controller
                  name="crewNumber"
                  control={control}
                  render={({ field }) => <Input id="crewNumber" placeholder="e.g., C123" {...field} className={cn(errors.crewNumber && "border-destructive")} />}
                />
                {errors.crewNumber && <p className="text-xs text-destructive">{errors.crewNumber.message}</p>}
              </div>
              
              {/* Crew Phone Number */}
              <div className="space-y-2">
                <Label htmlFor="crewPhoneNumber" className="flex items-center text-foreground">
                  <User className="mr-2 h-4 w-4 text-primary" /> Crew Phone N.º
                </Label>
                <Controller
                  name="crewPhoneNumber"
                  control={control}
                  render={({ field }) => (
                    <Input
                      id="crewPhoneNumber"
                      placeholder="(XXX) XXX-XXXX"
                      {...field}
                      onChange={(e) => {
                        handlePhoneInputChange(e); // formats input
                        field.onChange(e); // ensures react-hook-form's onChange is still called
                      }}
                      className={cn(errors.crewPhoneNumber && "border-destructive")}
                    />
                  )}
                />
                {errors.crewPhoneNumber && <p className="text-xs text-destructive">{errors.crewPhoneNumber.message}</p>}
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* General Foreman Name */}
              <div className="space-y-2">
                <Label htmlFor="generalForemanName" className="flex items-center text-foreground">
                  <User className="mr-2 h-4 w-4 text-primary" /> General Foreman Name
                </Label>
                <Controller
                  name="generalForemanName"
                  control={control}
                  render={({ field }) => <Input id="generalForemanName" placeholder="Full name" {...field} className={cn(errors.generalForemanName && "border-destructive")} />}
                />
                {errors.generalForemanName && <p className="text-xs text-destructive">{errors.generalForemanName.message}</p>}
              </div>

              {/* Foreman Name */}
              <div className="space-y-2">
                <Label htmlFor="foremanName" className="flex items-center text-foreground">
                  <User className="mr-2 h-4 w-4 text-primary" /> Foreman Name (Briefing)
                </Label>
                <Controller
                  name="foremanName"
                  control={control}
                  render={({ field }) => <Input id="foremanName" placeholder="Full name" {...field} className={cn(errors.foremanName && "border-destructive")} />}
                />
                {errors.foremanName && <p className="text-xs text-destructive">{errors.foremanName.message}</p>}
              </div>
            </div>

            {/* Work Location */}
            <div className="space-y-2">
              <Label htmlFor="workLocation" className="flex items-center text-foreground">
                <MapPin className="mr-2 h-4 w-4 text-primary" /> Work Location
              </Label>
              <Controller
                name="workLocation"
                control={control}
                render={({ field }) => <Input id="workLocation" placeholder="Street address or description" {...field} className={cn(errors.workLocation && "border-destructive")} />}
              />
              {errors.workLocation && <p className="text-xs text-destructive">{errors.workLocation.message}</p>}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between p-6 sm:p-8 border-t">
            <Button type="button" variant="outline" onClick={handlePrevious}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Main Menu
            </Button>
            <Button type="submit">
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
