"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, TriangleAlert as ReportProblemIcon, Loader2 } from 'lucide-react';
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
  generalDefectDetails: string;
}

interface UiText {
  pageTitle: string;
  pageDescription: string;
  truckDefectsTitle: string;
  trailerDefectsTitle: string;
  otherTruckPlaceholder: string;
  otherTrailerPlaceholder: string;
  generalDetailsLabel: string;
  generalDetailsPlaceholder: string;
  submitButton: string;
  submittingButton: string;
  toastTitle: string;
  toastDescriptionTruck: string;
  toastDescriptionTrailer: string;
  toastDescriptionOtherTruck: string;
  toastDescriptionOtherTrailer: string;
  toastDescriptionGeneral: string;
  toastNone: string;
  toastNotApplicable: string;
}

const uiTextEn: UiText = {
  pageTitle: "Add Vehicle Defects",
  pageDescription: "Select any observed defects for the truck and/or trailer. Provide additional details if necessary.",
  truckDefectsTitle: "Truck Defects",
  trailerDefectsTitle: "Trailer Defects",
  otherTruckPlaceholder: "Specify other truck defect(s)...",
  otherTrailerPlaceholder: "Specify other trailer defect(s)...",
  generalDetailsLabel: "Additional Details",
  generalDetailsPlaceholder: "Provide any other relevant details about the defects observed...",
  submitButton: "Submit Defects",
  submittingButton: "Submitting...",
  toastTitle: "Defects Logged (Placeholder)",
  toastDescriptionTruck: "Truck",
  toastDescriptionTrailer: "Trailer",
  toastDescriptionOtherTruck: "Other Truck",
  toastDescriptionOtherTrailer: "Other Trailer",
  toastDescriptionGeneral: "General Details",
  toastNone: "None",
  toastNotApplicable: "N/A",
};

const uiTextEs: UiText = {
  pageTitle: "Agregar Defectos del Vehículo",
  pageDescription: "Seleccione cualquier defecto observado para el camión y/o remolque. Proporcione detalles adicionales si es necesario.",
  truckDefectsTitle: "Defectos del Camión",
  trailerDefectsTitle: "Defectos del Remolque",
  otherTruckPlaceholder: "Especifique otro(s) defecto(s) del camión...",
  otherTrailerPlaceholder: "Especifique otro(s) defecto(s) del remolque...",
  generalDetailsLabel: "Detalles Adicionales",
  generalDetailsPlaceholder: "Proporcione cualquier otro detalle relevante sobre los defectos observados...",
  submitButton: "Enviar Defectos",
  submittingButton: "Enviando...",
  toastTitle: "Defectos Registrados (Marcador de posición)",
  toastDescriptionTruck: "Camión",
  toastDescriptionTrailer: "Remolque",
  toastDescriptionOtherTruck: "Otro Camión",
  toastDescriptionOtherTrailer: "Otro Remolque",
  toastDescriptionGeneral: "Detalles Generales",
  toastNone: "Ninguno",
  toastNotApplicable: "N/A",
};


export default function AddDefectsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [lang, setLang] = useState<'en' | 'es'>('en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDefects, setSelectedDefects] = useState<SelectedDefects>({
    truck: [],
    trailer: [],
    otherTruckText: '',
    otherTrailerText: '',
    generalDefectDetails: '',
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 300));

    const truckDefectsToLog = selectedDefects.truck.join(', ') || currentUiText.toastNone;
    const trailerDefectsToLog = selectedDefects.trailer.join(', ') || currentUiText.toastNone;
    const generalDetailsToLog = selectedDefects.generalDefectDetails || currentUiText.toastNotApplicable;

    toast({
      title: currentUiText.toastTitle,
      description: `${currentUiText.toastDescriptionTruck}: ${truckDefectsToLog}. ${currentUiText.toastDescriptionTrailer}: ${trailerDefectsToLog}. ${currentUiText.toastDescriptionOtherTruck}: ${selectedDefects.otherTruckText || currentUiText.toastNotApplicable}. ${currentUiText.toastDescriptionOtherTrailer}: ${selectedDefects.otherTrailerText || currentUiText.toastNotApplicable}. ${currentUiText.toastDescriptionGeneral}: ${generalDetailsToLog}`,
    });
    
    setIsSubmitting(false);
  };

  const hasSelectedAnyDefect = 
    selectedDefects.truck.length > 0 ||
    selectedDefects.trailer.length > 0 ||
    selectedDefects.otherTruckText.trim() !== '' ||
    selectedDefects.otherTrailerText.trim() !== '' ||
    selectedDefects.generalDefectDetails.trim() !== '';

  return (
    <div className="flex flex-col min-h-screen bg-background p-4">
      <Toaster />
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="mr-2" disabled={isSubmitting}>
          <ChevronLeft className="h-8 w-8" />
        </Button>
        {/* AppHeader removed from here, it is now global */}
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
                      disabled={isSubmitting}
                    />
                    <Label htmlFor={`truck-${truckDefectValue(index)}`} className="text-sm font-normal cursor-pointer">
                      {defect}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedDefects.truck.includes(TRUCK_DEFECTS_LIST_EN[TRUCK_DEFECTS_LIST_EN.length - 1]) && ( 
                <Textarea
                  placeholder={currentUiText.otherTruckPlaceholder}
                  value={selectedDefects.otherTruckText}
                  onChange={(e) => setSelectedDefects(prev => ({ ...prev, otherTruckText: e.target.value }))}
                  className="mt-3 text-sm"
                  disabled={isSubmitting}
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
                      disabled={isSubmitting}
                    />
                    <Label htmlFor={`trailer-${trailerDefectValue(index)}`} className="text-sm font-normal cursor-pointer">
                      {defect}
                    </Label>
                  </div>
                ))}
              </div>
              {selectedDefects.trailer.includes(TRAILER_DEFECTS_LIST_EN[TRAILER_DEFECTS_LIST_EN.length - 1]) && ( 
                <Textarea
                  placeholder={currentUiText.otherTrailerPlaceholder}
                  value={selectedDefects.otherTrailerText}
                  onChange={(e) => setSelectedDefects(prev => ({ ...prev, otherTrailerText: e.target.value }))}
                  className="mt-3 text-sm"
                  disabled={isSubmitting}
                />
              )}
            </div>

            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="generalDefectDetails" className="text-xl font-semibold text-foreground">
                {currentUiText.generalDetailsLabel}
              </Label>
              <Textarea
                id="generalDefectDetails"
                placeholder={currentUiText.generalDetailsPlaceholder}
                value={selectedDefects.generalDefectDetails}
                onChange={(e) => setSelectedDefects(prev => ({ ...prev, generalDefectDetails: e.target.value }))}
                className="text-sm min-h-[100px]"
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
        </ScrollArea>
        
        <CardFooter className="flex justify-end pt-6 border-t mt-auto">
          <Button size="lg" onClick={handleSubmit} disabled={isSubmitting || !hasSelectedAnyDefect}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {isSubmitting ? currentUiText.submittingButton : currentUiText.submitButton}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}