"use client";

import React, { useState, useEffect, useMemo, type FC, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

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

const MONTHS_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTHS_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const CURRENT_YEAR = new Date().getFullYear();
const YEAR_RANGE_START = 1940;
const YEARS_PER_PAGE = 12;
const DAYS_PER_PAGE = 10; // Nuevo: Días a mostrar por página

// Helper to check for a leap year
const isLeapYear = (year: number) => (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);

// Reusable Tile component for months, days, and years
const Tile: FC<{ onClick: () => void; isSelected: boolean; children: React.ReactNode; className?: string }> = ({ onClick, isSelected, children, className }) => (
    <div
        onClick={onClick}
        className={cn(
            "aspect-square flex justify-center items-center border-2 border-border rounded-lg cursor-pointer text-base font-medium transition-all duration-200 ease-in-out hover:scale-105 hover:border-primary",
            "sm:rounded-xl", // Slightly larger radius on bigger screens
            isSelected && "bg-primary text-primary-foreground border-primary scale-105 font-bold",
            className
        )}
    >
        {children}
    </div>
);

const BirthDayStep: FC<BirthDayStepProps> = ({ onInputChange, onValidityChange, expectedBirthDate }) => {
    const [view, setView] = useState<'month' | 'day' | 'year'>('month');
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);
    const [dayPage, setDayPage] = useState(0); // Nuevo: Estado para la paginación de días
    const [yearPage, setYearPage] = useState(0);

    const validateDate = useCallback((month: number, day: number, year: number): boolean => {
        if (!expectedBirthDate) return false;
        try {
            const expected = new Date(expectedBirthDate);
            if (isNaN(expected.getTime())) return false;
            
            return (
                year === expected.getUTCFullYear() &&
                month === expected.getUTCMonth() &&
                day === expected.getUTCDate()
            );
        } catch {
            return false;
        }
    }, [expectedBirthDate]);

    // Final validation effect
    useEffect(() => {
        if (selectedMonth !== null && selectedDay !== null && selectedYear !== null) {
            onInputChange({ name: 'birthMonth', value: String(selectedMonth + 1) });
            onInputChange({ name: 'birthDay', value: String(selectedDay) });
            onInputChange({ name: 'birthYear', value: String(selectedYear) });

            const isValid = validateDate(selectedMonth, selectedDay, selectedYear);
            onValidityChange(isValid);
        } else {
            onValidityChange(false);
        }
    }, [selectedYear, selectedDay, selectedMonth, onInputChange, onValidityChange, validateDate]);

    // Memoized calculations for performance
    const daysInSelectedMonth = useMemo(() => {
        if (selectedMonth === null) return 0;
        if (selectedMonth === 1) return 29;
        return new Date(2023, selectedMonth + 1, 0).getDate();
    }, [selectedMonth]);
    
    // Nuevo: Paginación de días
    const dayChunks = useMemo(() => {
        if (daysInSelectedMonth === 0) return [];
        const days = Array.from({ length: daysInSelectedMonth }, (_, i) => i + 1);
        const chunks = [];
        for (let i = 0; i < days.length; i += DAYS_PER_PAGE) {
            chunks.push(days.slice(i, i + DAYS_PER_PAGE));
        }
        return chunks;
    }, [daysInSelectedMonth]);

    const currentDayChunk = dayChunks[dayPage] || [];
    
    const yearChunks = useMemo(() => {
        const isFeb29 = selectedMonth === 1 && selectedDay === 29;
        const years = [];
        for (let y = CURRENT_YEAR; y >= YEAR_RANGE_START; y--) {
            if (!isFeb29 || (isFeb29 && isLeapYear(y))) {
                years.push(y);
            }
        }
        
        const chunks = [];
        for (let i = 0; i < years.length; i += YEARS_PER_PAGE) {
            chunks.push(years.slice(i, i + YEARS_PER_PAGE));
        }
        return chunks;
    }, [selectedMonth, selectedDay]);

    const currentYearChunk = yearChunks[yearPage] || [];

    // Handlers
    const handleMonthSelect = (month: number) => { setSelectedMonth(month); setView('day'); };
    const handleDaySelect = (day: number) => { setSelectedDay(day); setView('year'); };
    const handleYearSelect = (year: number) => { setSelectedYear(year); };
    
    const goBack = () => {
        if (view === 'year') {
            setSelectedYear(null);
            setView('day');
        } else if (view === 'day') {
            setSelectedDay(null);
            setDayPage(0); // Reset day page on going back
            setView('month');
        }
    };

    const getHeaderText = () => {
        switch (view) {
            case 'month': return 'Elige el mes';
            case 'day': return `Día de ${selectedMonth !== null ? MONTHS_FULL[selectedMonth] : ''}`;
            case 'year': return '¿En qué año?';
        }
    };
    
    const getSummaryText = () => {
        if (selectedYear !== null) return `${selectedDay} de ${MONTHS_FULL[selectedMonth!]} de ${selectedYear}`;
        if (selectedDay !== null) return `${selectedDay} de ${MONTHS_FULL[selectedMonth!]}...`;
        if (selectedMonth !== null) return `${MONTHS_FULL[selectedMonth]}...`;
        return '\u00A0'; // Non-breaking space
    };

    // Responsive grid classes
    const responsiveGridClasses = "grid gap-3 sm:gap-4 [grid-template-columns:repeat(auto-fill,minmax(max(60px,18vw),1fr))] sm:[grid-template-columns:repeat(auto-fill,minmax(80px,1fr))]";

    return (
        <Card className="w-full max-w-md border-none shadow-none flex flex-col">
            <CardContent className="pt-2 sm:pt-6 flex flex-col flex-grow">
                {/* Header */}
                <div className="flex items-center mb-4 flex-shrink-0">
                    {view !== 'month' && (
                        <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                    )}
                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground text-center flex-grow">{getHeaderText()}</h2>
                    {view !== 'month' && <div className="w-10" />}
                </div>

                {/* Grid Views container with flexible height and scrolling */}
                <div className="flex-grow overflow-y-auto pr-2 -mr-2">
                    {view === 'month' && (
                        <div className={cn(responsiveGridClasses)}>
                            {MONTHS_ABBR.map((abbr, index) => (
                                <Tile key={abbr} onClick={() => handleMonthSelect(index)} isSelected={selectedMonth === index}>{abbr}</Tile>
                            ))}
                        </div>
                    )}
                    {view === 'day' && (
                        <div className="flex flex-col h-full">
                            <div className="flex justify-between items-center mb-3 flex-shrink-0">
                                <Button variant="outline" size="sm" onClick={() => setDayPage(p => Math.max(0, p - 1))} disabled={dayPage === 0}>
                                    <ChevronLeft className="h-4 w-4 mr-1"/> Prev
                                </Button>
                                <span className="text-sm font-medium text-muted-foreground">
                                    {currentDayChunk[0]} - {currentDayChunk[currentDayChunk.length - 1]}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => setDayPage(p => Math.min(dayChunks.length - 1, p + 1))} disabled={dayPage >= dayChunks.length - 1}>
                                    Next <ChevronRight className="h-4 w-4 ml-1"/>
                                </Button>
                            </div>
                            <div className={cn(responsiveGridClasses, "pr-1")}>
                                {currentDayChunk.map((day) => (
                                    <Tile key={day} onClick={() => handleDaySelect(day)} isSelected={selectedDay === day}>{day}</Tile>
                                ))}
                            </div>
                        </div>
                    )}
                    {view === 'year' && (
                        <div className="flex flex-col h-full">
                             <div className="flex justify-between items-center mb-3 flex-shrink-0">
                                <Button variant="outline" size="sm" onClick={() => setYearPage(p => Math.max(0, p - 1))} disabled={yearPage === 0}>
                                    <ChevronLeft className="h-4 w-4 mr-1"/> Prev
                                </Button>
                                <span className="text-sm font-medium text-muted-foreground">
                                    {currentYearChunk[currentYearChunk.length - 1]} - {currentYearChunk[0]}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => setYearPage(p => Math.min(yearChunks.length - 1, p + 1))} disabled={yearPage >= yearChunks.length - 1}>
                                    Next <ChevronRight className="h-4 w-4 ml-1"/>
                                </Button>
                            </div>
                            <div className={cn(responsiveGridClasses, "pr-1")}>
                                {currentYearChunk.map(year => (
                                    <Tile key={year} onClick={() => handleYearSelect(year)} isSelected={selectedYear === year}>{year}</Tile>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Summary Label with fixed height to prevent layout jumps */}
                <div className="text-center text-lg sm:text-xl font-bold text-primary mt-4 h-8 flex-shrink-0">
                    <p>{getSummaryText()}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default BirthDayStep;