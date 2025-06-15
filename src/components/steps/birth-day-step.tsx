"use client";

import type { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect, useCallback } from 'react';

// Nombres de los meses para mostrar en el resultado final
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Generamos los años dinámicamente
const currentYear = new Date().getFullYear();
const startYear = 1940;
const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => (currentYear - i).toString());

type BirthDateData = {
  birthMonth: string;
  birthDay: string;
  birthYear: string;
};

interface BirthDayStepProps {
  formData: BirthDateData;
  onInputChange: (e: { name: keyof BirthDateData; value: string }) => void;
  onValidityChange: (isValid: boolean) => void;
  expectedBirthDate: string;
}

const BirthDayStep: FC<BirthDayStepProps> = ({ formData, onInputChange, onValidityChange, expectedBirthDate }) => {
  const [dayOptions, setDayOptions] = useState<string[]>([]);
  const [displayDate, setDisplayDate] = useState('');
  const [isDateValid, setIsDateValid] = useState(false);

  const handleSelectChange = (name: keyof BirthDateData, value: string) => {
    onInputChange({ name, value });
  };

  const validateDate = useCallback((month: string, day: string, year: string): boolean => {
    if (!expectedBirthDate) return false;

    try {
      const expectedDate = new Date(expectedBirthDate);
      // Check for invalid date string from props
      if (isNaN(expectedDate.getTime())) {
        console.error("Invalid expectedBirthDate prop:", expectedBirthDate);
        return false;
      }

      const expectedYear = expectedDate.getUTCFullYear();
      const expectedMonth = expectedDate.getUTCMonth() + 1; // getUTCMonth is 0-indexed
      const expectedDay = expectedDate.getUTCDate();

      // Compare with form data (which are strings)
      return (
        year === String(expectedYear) &&
        month === String(expectedMonth) &&
        day === String(expectedDay)
      );
    } catch (e) {
      console.error("Error parsing expectedBirthDate:", e);
      return false;
    }
  }, [expectedBirthDate]);
  
  /**
   * EFECTO 1: Actualizar las opciones de días.
   */
  useEffect(() => {
    const monthInt = parseInt(formData.birthMonth, 10);
    const yearInt = parseInt(formData.birthYear, 10);
    const currentDay = formData.birthDay;

    if (!monthInt) {
      setDayOptions([]);
      if (currentDay) {
        onInputChange({ name: 'birthDay', value: '' });
      }
      return;
    }
    
    const daysInMonth = new Date(yearInt || new Date().getFullYear(), monthInt, 0).getDate();
    const newDayOptions = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    
    setDayOptions(newDayOptions);

    if (currentDay && parseInt(currentDay, 10) > daysInMonth) {
      onInputChange({ name: 'birthDay', value: '' });
    }
  }, [formData.birthMonth, formData.birthYear, formData.birthDay, onInputChange]);

  /**
   * EFECTO 2: Actualizar el mensaje de resultado y validar la fecha.
   */
  useEffect(() => {
    const { birthMonth, birthDay, birthYear } = formData;

    if (birthMonth && birthDay && birthYear) {
      const monthInt = parseInt(birthMonth, 10);
      if (monthInt >= 1 && monthInt <= 12) {
        const monthIndex = monthInt - 1;
        const monthName = monthNames[monthIndex];
        setDisplayDate(`Fecha seleccionada: ${birthDay} de ${monthName} de ${birthYear}`);
      } else {
        setDisplayDate('Fecha inválida');
        setIsDateValid(false);
        onValidityChange(false);
        return;
      }

      const isValid = validateDate(birthMonth, birthDay, birthYear);
      setIsDateValid(isValid);
      onValidityChange(isValid);

    } else {
      setDisplayDate('');
      setIsDateValid(false);
      onValidityChange(false);
    }
  }, [formData, onValidityChange, validateDate]);

  return (
    <Card className="w-full max-w-md border-none shadow-none">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center space-y-6 text-center">
          <h2 className="text-xl font-semibold text-foreground">Ingresa tu fecha de nacimiento</h2>
          
          <div className="flex w-full justify-center gap-x-4">
            
            <div className="flex flex-1 flex-col items-start gap-y-1.5">
              <Label htmlFor="birthMonth">Mes</Label>
              <Select
                name="birthMonth"
                value={formData.birthMonth}
                onValueChange={(value) => handleSelectChange('birthMonth', value)}
              >
                <SelectTrigger id="birthMonth">
                  <SelectValue placeholder="Mes" />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((month, index) => (
                    <SelectItem key={month} value={(index + 1).toString()}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-1 flex-col items-start gap-y-1.5">
              <Label htmlFor="birthDay">Día</Label>
              <Select
                name="birthDay"
                value={formData.birthDay}
                onValueChange={(value) => handleSelectChange('birthDay', value)}
                disabled={dayOptions.length === 0}
              >
                <SelectTrigger id="birthDay">
                  <SelectValue placeholder="Día" />
                </SelectTrigger>
                <SelectContent>
                  {dayOptions.map((day) => (
                    <SelectItem key={day} value={day}>
                      {day}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-1 flex-col items-start gap-y-1.5">
              <Label htmlFor="birthYear">Año</Label>
              <Select
                name="birthYear"
                value={formData.birthYear}
                onValueChange={(value) => handleSelectChange('birthYear', value)}
              >
                <SelectTrigger id="birthYear">
                  <SelectValue placeholder="Año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 min-h-[28px]">
             {displayDate && (
                <p className="text-lg font-semibold text-foreground">
                    {displayDate}
                </p>
             )}
          </div>

        </div>
      </CardContent>
    </Card>
  );
};

export default BirthDayStep;