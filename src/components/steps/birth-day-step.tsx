"use client";

import type { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from "@/components/ui/label"; // Asegúrate de importar el componente Label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { FormData } from '@/types';
import { useState, useEffect } from 'react';

// Nombres de los meses para mostrar en el resultado final
const monthNames = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// Generamos los años dinámicamente
const currentYear = new Date().getFullYear();
const startYear = 1940;
const years = Array.from({ length: currentYear - startYear + 1 }, (_, i) => (currentYear - i).toString());

interface BirthDayStepProps {
  formData: { birthMonth: string; birthDay: string; birthYear: string };
  onInputChange: (e: { name: keyof Pick<FormData, 'birthMonth' | 'birthDay' | 'birthYear'>; value: string }) => void;
}

const BirthDayStep: FC<BirthDayStepProps> = ({ formData, onInputChange }) => {
  // Estado para las opciones del selector de día (se actualiza dinámicamente)
  const [dayOptions, setDayOptions] = useState<string[]>([]);
  // Estado para mostrar la fecha seleccionada, similar a <p id="resultado">
  const [displayDate, setDisplayDate] = useState('');

  // Función para manejar el cambio en cualquier selector
  const handleSelectChange = (name: keyof Pick<FormData, 'birthMonth' | 'birthDay' | 'birthYear'>, value: string) => {
    onInputChange({ name, value });
  };

  /**
   * EFECTO 1: Actualizar las opciones de días.
   * Se ejecuta cuando el mes o el año cambian.
   */
  useEffect(() => {
    const monthInt = parseInt(formData.birthMonth, 10);
    const yearInt = parseInt(formData.birthYear, 10);
    const currentDay = formData.birthDay;

    if (!monthInt) {
      setDayOptions([]);
      if (currentDay) {
        // Usamos la prop 'onInputChange' directamente
        onInputChange({ name: 'birthDay', value: '' });
      }
      return;
    }
    
    const daysInMonth = new Date(yearInt || new Date().getFullYear(), monthInt, 0).getDate();
    const newDayOptions = Array.from({ length: daysInMonth }, (_, i) => (i + 1).toString());
    
    setDayOptions(newDayOptions);

    if (currentDay && parseInt(currentDay, 10) > daysInMonth) {
      // Usamos la prop 'onInputChange' directamente
      onInputChange({ name: 'birthDay', value: '' });
    }
    // La práctica correcta es incluir 'onInputChange' en el array de dependencias.
  }, [formData.birthMonth, formData.birthYear, formData.birthDay, onInputChange]);


  /**
   * EFECTO 2: Actualizar el mensaje de resultado.
   * Se ejecuta cada vez que cambia la fecha para mostrar el resultado final.
   */
  useEffect(() => {
    const { birthMonth, birthDay, birthYear } = formData;

    if (birthMonth && birthDay && birthYear) {
      const monthIndex = parseInt(birthMonth, 10) - 1;
      const monthName = monthNames[monthIndex];
      setDisplayDate(`Fecha seleccionada: ${birthDay} de ${monthName} de ${birthYear}`);
    } else {
      setDisplayDate('');
    }
  }, [formData]);

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