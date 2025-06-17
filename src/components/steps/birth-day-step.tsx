"use client";

import React, { useState, useEffect, useMemo, type FC } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface BirthDayStepProps {
  onInputChange: (e: { name: 'birthMonth' | 'birthDay' | 'birthYear'; value: string }) => void;
  onValidityChange: (isValid: boolean) => void;
  expectedBirthDate: string; // "YYYY-MM-DD" format
  onMaxAttemptsReached: () => void;
}

const MONTHS_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
const MONTHS_FULL = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const YEAR_RANGE_START = 1940;
const CURRENT_YEAR = new Date().getFullYear();

const Tile: FC<{ onClick: () => void; isSelected: boolean; children: React.ReactNode; className?: string }> = ({ onClick, isSelected, children, className }) => (
    <div
        onClick={onClick}
        className={cn(
            "aspect-square flex justify-center items-center border-2 border-border rounded-lg cursor-pointer text-base font-medium transition-all duration-200 ease-in-out hover:scale-105 hover:border-primary",
            "sm:rounded-xl",
            isSelected && "bg-primary text-primary-foreground border-primary scale-105 font-bold",
            className
        )}
    >
        {children}
    </div>
);

const BirthDayStep: FC<BirthDayStepProps> = ({ onInputChange, onValidityChange, expectedBirthDate, onMaxAttemptsReached }) => {
    const [view, setView] = useState<'month' | 'day' | 'year'>('month');
    const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
    const [selectedDay, setSelectedDay] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<number | null>(null);

    const [monthFailures, setMonthFailures] = useState(0);
    const [dayFailures, setDayFailures] = useState(0);
    const [yearFailures, setYearFailures] = useState(0);
    
    const [isShaking, setIsShaking] = useState(false);
    const [dayOptions, setDayOptions] = useState<number[]>([]);
    const [yearOptions, setYearOptions] = useState<number[]>([]);

    const { correctDay, correctMonth, correctYear } = useMemo(() => {
        // CORRECCIÓN: Analizar la fecha en formato YYYY-MM-DD.
        const parts = expectedBirthDate.split('-');
        if (parts.length === 3) {
            return {
                correctYear: parseInt(parts[0], 10),
                correctMonth: parseInt(parts[1], 10) - 1,
                correctDay: parseInt(parts[2], 10),
            };
        }
        return { correctDay: 0, correctMonth: 0, correctYear: 0 };
    }, [expectedBirthDate]);

    useEffect(() => {
        if (view === 'day') {
            const daysInMonth = new Date(correctYear, correctMonth + 1, 0).getDate();
            const randomOffset = Math.floor(Math.random() * 12);
            let startDay = correctDay - randomOffset;
            startDay = Math.max(1, startDay);
            startDay = Math.min(startDay, Math.max(1, daysInMonth - 11));
            setDayOptions(Array.from({ length: 12 }, (_, i) => startDay + i));
        }
    }, [view, correctDay, correctMonth, correctYear]);

    useEffect(() => {
        if (view === 'year') {
            const randomOffset = Math.floor(Math.random() * 12);
            let startYear = correctYear - randomOffset;
            startYear = Math.max(YEAR_RANGE_START, startYear);
            startYear = Math.min(startYear, CURRENT_YEAR - 11);
            setYearOptions(Array.from({ length: 12 }, (_, i) => startYear + i));
        }
    }, [view, correctYear]);

    const triggerShake = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
    };

    const handleMonthSelect = (month: number) => {
        if (month === correctMonth) {
            setSelectedMonth(month);
            setView('day');
        } else {
            setMonthFailures(prev => prev + 1);
            triggerShake();
        }
    };

    const handleDaySelect = (day: number) => {
        if (day === correctDay) {
            setSelectedDay(day);
            setView('year');
        } else {
            setDayFailures(prev => prev + 1);
            triggerShake();
        }
    };

    const handleYearSelect = (year: number) => {
        if (year === correctYear) {
            setSelectedYear(year);
        } else {
            setYearFailures(prev => prev + 1);
            triggerShake();
        }
    };

    useEffect(() => {
        if (monthFailures >= 3 || dayFailures >= 3 || yearFailures >= 3) {
            onMaxAttemptsReached();
        }
    }, [monthFailures, dayFailures, yearFailures, onMaxAttemptsReached]);

    useEffect(() => {
        const isCompleteAndCorrect = selectedMonth === correctMonth && selectedDay === correctDay && selectedYear === correctYear;
        
        if (isCompleteAndCorrect) {
            onInputChange({ name: 'birthMonth', value: String(selectedMonth + 1) });
            onInputChange({ name: 'birthDay', value: String(selectedDay) });
            onInputChange({ name: 'birthYear', value: String(selectedYear) });
            onValidityChange(true);
        } else {
            onValidityChange(false);
        }
    }, [selectedYear, selectedDay, selectedMonth, correctYear, correctMonth, correctDay, onInputChange, onValidityChange]);

    const goBack = () => {
        if (view === 'year') {
            setSelectedYear(null);
            setView('day');
        } else if (view === 'day') {
            setSelectedDay(null);
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
        return '\u00A0';
    };

    const gridLayout = "grid grid-cols-3 sm:grid-cols-4 gap-3 sm:gap-4";

    return (
        <Card className={cn("w-full max-w-md border-none shadow-none flex flex-col", isShaking && "animate-shake")}>
            <CardContent className="pt-2 sm:pt-6 flex flex-col flex-grow">
                <div className="flex items-center mb-4 flex-shrink-0">
                    {view !== 'month' && (
                        <Button variant="ghost" size="icon" onClick={goBack} className="mr-2">
                            <ChevronLeft className="h-6 w-6" />
                        </Button>
                    )}
                    <h2 className="text-xl sm:text-2xl font-semibold text-foreground text-center flex-grow">{getHeaderText()}</h2>
                    {view !== 'month' && <div className="w-10" />}
                </div>

                <div className="flex-grow pr-2 -mr-2">
                    {view === 'month' && (
                        <div className={gridLayout}>
                            {MONTHS_ABBR.map((abbr, index) => (
                                <Tile key={abbr} onClick={() => handleMonthSelect(index)} isSelected={selectedMonth === index}>{abbr}</Tile>
                            ))}
                        </div>
                    )}
                    {view === 'day' && (
                        <div className={gridLayout}>
                            {dayOptions.map((day) => (
                                <Tile key={day} onClick={() => handleDaySelect(day)} isSelected={selectedDay === day}>{day}</Tile>
                            ))}
                        </div>
                    )}
                    {view === 'year' && (
                        <div className={gridLayout}>
                            {yearOptions.map(year => (
                                <Tile key={year} onClick={() => handleYearSelect(year)} isSelected={selectedYear === year}>{year}</Tile>
                            ))}
                        </div>
                    )}
                </div>

                <div className="text-center text-lg sm:text-xl font-bold text-primary mt-4 h-8 flex-shrink-0">
                    <p>{getSummaryText()}</p>
                </div>
            </CardContent>
        </Card>
    );
};

export default BirthDayStep;