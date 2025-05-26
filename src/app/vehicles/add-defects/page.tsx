
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppHeader from '@/components/app-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, TriangleAlert as ReportProblemIcon } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from "@/hooks/use-toast";
import { Toaster } from '@/components/ui/toaster';

const TRUCK_DEFECTS_LIST_EN = [
  "Air Compressor", "Air Lines", "Battery", "Brake Accessories", "Brakes", "Carburetor", 
  "Clutch", "Coupling Devices", "Defroster/Heater", "Drive Line", "Engine", "Exhaust", 
  "Fifth Wheel", "Frame & Assembly", "Front Axle", "Fuel Tanks", "Horn", 
  "Lights (Head, Stop, Tail, Dash, Turn Indicators)", "Mirrors", "Oil Pressure", 
  "Radiator", "Rear End", "Reflectors", 
  "Safety Equipment (Fire Extinguisher, Flags, Flares, Fuses, Reflective Triangles)", 
  "Springs", "Starter", "Steering", "Tachograph", "Tires", "Transmission", 
  "Trip Recorder", "Wheels, Rims, Lugs, Spacers", "Windows", "Windshield Wipers", "Other Truck Defect"
];

const TRAILER_DEFECTS_LIST_EN = [
  "Air Lines", "Brake Connections", "Brakes", "Coupling Devices (King Pin/Apron)", 
  "Coupling (Pin/Chains)", "Doors", "Frame & Body", "Hitch", "Landing Gear", 
  "Lights (All)", "Reflectors/Reflective Tape", "Roof", "Springs", "Suspension", 
  "Tarpaulin", "Tires", "Wheels & Rims", "Other Trailer Defect"
];

const TRUCK_DEFECTS_LIST_ES = [
  "Compresor de Aire", "Líneas de Aire", "Batería", "Accesorios de Freno", "Frenos", "Carburador",
  "Embrague", "Dispositivos de Acoplamiento", "Desempañador/Calefactor", "Línea de Transmisión", "Motor", "Escape",
  "Quinta Rueda", "Chasis y Ensamblaje", "Eje Delantero", "Tanques de Combustible", "Bocina",
  "Luces (Delanteras, Freno, Traseras, Tablero, Intermitentes)", "Espejos", "Presión de Aceite",
  "Radiador", "Diferencial Trasero", "Reflectores",
  "Equipo de Seguridad (Extintor, Banderas, Bengalas, Fusibles, Triángulos Reflectantes)",
  "Muelles/Resortes", "Motor de Arranque", "Dirección", "Tacógrafo", "Llantas/Neumáticos", "Transmisión",
  "Registrador de Viaje", "Ruedas, Rines, Tuercas, Espaciadores", "Ventanas", "Limpiaparabrisas", "Otro Defecto del Camión"
];

const TRAILER_DEFECTS_LIST_ES = [
  "Líneas de Aire", "Conexiones de Freno", "Frenos", "Dispositivos de Acoplamiento (Perno Rey/Placa)",
  "Acoplamiento (Perno/Cadenas)", "Puertas", "Chasis y Carrocería", "Enganche", "Tren de Aterrizaje",
  "Luces (Todas)", "Reflectores/Cinta Reflectante", "Techo", "Muelles/Resortes", "Suspensión",
  "Lona", "Llantas/Neumáticos", "Ruedas y Rines", "Otro Defecto del Remolque"
];

interface SelectedDefects {
  truck: string[];
  trailer: string[];
  otherTruckText: string;
  otherTrailerText: string;
}

interface UiText {
  pageTitle: string;
  pageDescription: string;
  truckDefectsTitle: string;
  trailerDefectsTitle: string;
  otherTruckPlaceholder: string;
  otherTrailerPlaceholder: string;
  submitButton: string;
  toastTitle: string;
  toastDescriptionTruck: string;
  toastDescriptionTrailer: string;
  toastDescriptionOtherTruck: string;
  toastDescriptionOtherTrailer: string;
  toastNone: string;
  toastNotApplicable: string;
}

const uiTextEn: UiText = {
  pageTitle: "Add Vehicle Defects",
  pageDescription: "Select any observed defects for the truck and/or trailer.",
  truckDefectsTitle: "Truck Defects",
  trailerDefectsTitle: "Trailer Defects",
  otherTruckPlaceholder: "Specify other truck defect(s)...",
  otherTrailerPlaceholder: "Specify other trailer defect(s)...",
  submitButton: "Submit Defects",
  toastTitle: "Defects Logged (Placeholder)",
  toastDescriptionTruck: "Truck",
  toastDescriptionTrailer: "Trailer",
  toastDescriptionOtherTruck: "Other Truck",
  toastDescriptionOtherTrailer: "Other Trailer",
  toastNone: "None",
  toastNotApplicable: "N/A",
};

const uiTextEs: UiText = {
  pageTitle: "Agregar Defectos del Vehículo",
  pageDescription: "Seleccione cualquier defecto observado para el camión y/o remolque.",
  truckDefectsTitle: "Defectos del Camión",
  trailerDefectsTitle: "Defectos del Remolque",
  otherTruckPlaceholder: "Especifique otro(s) defecto(s) del camión...",
  otherTrailerPlaceholder: "Especifique otro(s) defecto(s) del remolque...",
  submitButton: "Enviar Defectos",
  toastTitle: "Defectos Registrados (Marcador de posición)",
  toastDescriptionTruck: "Camión",
  toastDescriptionTrailer: "Remolque",
  toastDescriptionOtherTruck: "Otro Camión",
  toastDescriptionOtherTrailer: "Otro Remolque",
  toastNone: "Ninguno",
  toastNotApplicable: "N/A",
};


export default function AddDefectsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [selectedDefects, setSelectedDefects] = useState<SelectedDefects>({
    truck: [],
    trailer: [],
    otherTruckText: '',
    otherTrailerText: '',
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const preferredLang = localStorage.getItem('preferredLang');
      if (preferredLang === 'es') {
        setLang('es');
      } else {
        setLang('en');
      }
    }
  }, []);

  const currentUiText = lang === 'es' ? uiTextEs : uiTextEn;
  const currentTruckDefectsList = lang === 'es' ? TRUCK_DEFECTS_LIST_ES : TRUCK_DEFECTS_LIST_EN;
  const currentTrailerDefectsList = lang === 'es' ? TRAILER_DEFECTS_LIST_ES : TRAILER_DEFECTS_LIST_EN;
  
  // Use original English values for state tracking if lists are different lengths (they should not be)
  const truckDefectValue = (index: number) => TRUCK_DEFECTS_LIST_EN[index];
  const trailerDefectValue = (index: number) => TRAILER_DEFECTS_LIST_EN[index];


  const handleCheckboxChange = (category: 'truck' | 'trailer', defectValue: string, checked: boolean) => {
    setSelectedDefects((prev) => {
      const currentCategoryDefects = prev[category];
      const newCategoryDefects = checked
        ? [...currentCategoryDefects, defectValue]
        : currentCategoryDefects.filter((d) => d !== defectValue);
      return { ...prev, [category]: newCategoryDefects };
    });
  };

  const handleSubmit = () => {
    // Translate selected defects back to English for consistent logging if needed, or log as is.
    // For this example, we log the values which are stored based on English list.
    const truckDefectsToLog = selectedDefects.truck.join(', ') || currentUiText.toastNone;
    const trailerDefectsToLog = selectedDefects.trailer.join(', ') || currentUiText.toastNone;

    toast({
      title: currentUiText.toastTitle,
      description: `${currentUiText.toastDescriptionTruck}: ${truckDefectsToLog}. ${currentUiText.toastDescriptionTrailer}: ${trailerDefectsToLog}. ${currentUiText.toastDescriptionOtherTruck}: ${selectedDefects.otherTruckText || currentUiText.toastNotApplicable}. ${currentUiText.toastDescriptionOtherTrailer}: ${selectedDefects.otherTrailerText || currentUiText.toastNotApplicable}`,
    });
  };

  const otherTruckDefectKey = lang === 'es' ? "Otro Defecto del Camión" : "Other Truck Defect";
  const otherTrailerDefectKey = lang === 'es' ? "Otro Defecto del Remolque" : "Other Trailer Defect";

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <Toaster />
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2">
          <ChevronLeft className="h-8 w-8" />
        </Button>
        <AppHeader className="flex-grow" />
      </div>

      <Card className="w-full flex-grow flex flex-col shadow-lg rounded-lg border-none">
        <CardHeader className="items-center text-center">
          <ReportProblemIcon className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-2xl font-heading-style">
            {currentUiText.pageTitle}
          </CardTitle>
          <CardDescription>{currentUiText.pageDescription}</CardDescription>
        </CardHeader>
        
        <ScrollArea className="flex-grow p-0">
          <CardContent className="space-y-6 p-6">
            <div>
              <h3 className="text-xl font-semibold mb-3 text-foreground border-b pb-2">{currentUiText.truckDefectsTitle}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                {currentTruckDefectsList.map((defect, index) => (
                  <div key={`truck-${truckDefectValue(index)}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`truck-${truckDefectValue(index)}`}
                      checked={selectedDefects.truck.includes(truckDefectValue(index))}
                      onCheckedChange={(checked) => handleCheckboxChange('truck', truckDefectValue(index), !!checked)}
                    />
                    <Label htmlFor={`truck-${truckDefectValue(index)}`} className="text-sm font-normal cursor-pointer">
                      {defect}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedDefects.truck.includes(TRUCK_DEFECTS_LIST_EN[TRUCK_DEFECTS_LIST_EN.length - 1]) && ( // Check against English "Other Truck Defect"
                <Textarea
                  placeholder={currentUiText.otherTruckPlaceholder}
                  value={selectedDefects.otherTruckText}
                  onChange={(e) => setSelectedDefects(prev => ({ ...prev, otherTruckText: e.target.value }))}
                  className="mt-3 text-sm"
                />
              )}
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3 text-foreground border-b pb-2">{currentUiText.trailerDefectsTitle}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3">
                {currentTrailerDefectsList.map((defect, index) => (
                  <div key={`trailer-${trailerDefectValue(index)}`} className="flex items-center space-x-2">
                    <Checkbox
                      id={`trailer-${trailerDefectValue(index)}`}
                      checked={selectedDefects.trailer.includes(trailerDefectValue(index))}
                      onCheckedChange={(checked) => handleCheckboxChange('trailer', trailerDefectValue(index), !!checked)}
                    />
                    <Label htmlFor={`trailer-${trailerDefectValue(index)}`} className="text-sm font-normal cursor-pointer">
                      {defect}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedDefects.trailer.includes(TRAILER_DEFECTS_LIST_EN[TRAILER_DEFECTS_LIST_EN.length - 1]) && ( // Check against English "Other Trailer Defect"
                <Textarea
                  placeholder={currentUiText.otherTrailerPlaceholder}
                  value={selectedDefects.otherTrailerText}
                  onChange={(e) => setSelectedDefects(prev => ({ ...prev, otherTrailerText: e.target.value }))}
                  className="mt-3 text-sm"
                />
              )}
            </div>
          </CardContent>
        </ScrollArea>
        
        <CardFooter className="flex justify-end pt-6 border-t mt-auto">
          <Button size="lg" onClick={handleSubmit}>
            {currentUiText.submitButton}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
