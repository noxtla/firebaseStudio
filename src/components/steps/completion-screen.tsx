import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCheck, Loader2, ShieldAlert, AlertTriangle } from 'lucide-react';
import type { UserData, CapturedLocation } from '@/types';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import { WEBHOOK_URL } from '@/config/appConfig';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CompletionScreenProps {
  capturedImage: string | null;
  captureTimestamp: string | null;
  capturedLocation: CapturedLocation | null;
  userData: UserData | null;
  onRestart: () => void;
  onValidationSuccess: () => void;
  onFinalSubmit: () => Promise<void>;
  isValidationComplete: boolean;
}

const CompletionScreen: FC<CompletionScreenProps> = ({
  capturedImage,
  captureTimestamp,
  capturedLocation,
  userData,
  onValidationSuccess,
  onFinalSubmit,
  isValidationComplete,
  onRestart,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [recognizedName, setRecognizedName] = useState<string | null>(null);
  const { toast } = useToast();

  const [isWorkAreaAlertOpen, setWorkAreaAlertOpen] = useState(false);
  const [isFaceMatchAlertOpen, setFaceMatchAlertOpen] = useState(false);
  const [faceMatchMessage, setFaceMatchMessage] = useState<string>("");

  // Botón "Validar Datos Biometricos"
  const handleValidationSubmit = async () => {
    setIsSubmitting(true);
    if (!capturedImage || !userData) {
      toast({ variant: "destructive", title: "Error de Envío" });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capturedImage,
          captureTimestamp,
          capturedLocation,
          userData,
          action: "capturedImage",
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        if (errorData?.Error === "User is outside of the designated work area") {
            setWorkAreaAlertOpen(true);
        } else if (Array.isArray(errorData) && errorData.length > 0 && errorData[0].response?.body?.Failed === "Face does not match profile") {
            const personName = errorData[0].response.body["Person is"];
            setFaceMatchMessage(`El rostro no coincide con el perfil. El sistema lo ha identificado como: ${personName}`);
            setFaceMatchAlertOpen(true);
        } else {
           throw new Error('API validation failed');
        }
        setIsSubmitting(false);
        return;
      }
      const result = await response.json();
      if (Array.isArray(result) && result.length > 0 && result[0]?.recognizedName) {
        setRecognizedName(result[0].recognizedName);
      }
      onValidationSuccess();
    } catch (error) {
      console.error("Error on validation submit:", error);
      toast({ variant: "destructive", title: "Error de Red", description: "No se pudo validar con el servidor." });
      setIsSubmitting(false);
    }
  };

  const handleRegistrationSubmit = async () => {
    setIsRegistering(true);
    await onFinalSubmit();
    // setIsRegistering(false) is not strictly needed as the component will unmount/change
  };

  if (!userData) return <p className="text-destructive text-center p-4">Error: Faltan los datos del usuario.</p>;

  return (
    <>
      <Card className="w-full border-none shadow-none">
        {isValidationComplete ? (
          // Vista de Registro (Paso 5)
          <>
            <CardHeader className="items-center pt-6 animate-step-enter">
              <UserCheck className="w-20 h-20 text-primary mb-4 animate-soft-pulse" />
              <CardTitle className="text-2xl sm:text-3xl text-center font-bold text-foreground">
                ¡Identidad Confirmada!
              </CardTitle>
              <CardDescription className="text-center text-lg px-2 mt-2 text-muted-foreground">
                Tus datos biométricos, ubicación e identidad han sido confirmados. Presiona el botón 'Registrar Asistencia' para terminar.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center pt-8">
              <Button 
                onClick={handleRegistrationSubmit}
                size="lg" 
                aria-label="Registrar Asistencia" 
                disabled={isRegistering}
                className="bg-success text-success-foreground hover:bg-success/90"
              >
                {isRegistering ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isRegistering ? "Registrando..." : "Registrar Asistencia"}
              </Button>
            </CardFooter>
          </>
        ) : (
          // Vista de Validación (Paso 4)
          <>
            <CardHeader className="items-center pt-6">
              <CardTitle className={cn("text-xl sm:text-2xl text-center font-heading-style")}>
                {isSubmitting ? 'Validando...' : 'Validación Biométrica'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              {capturedImage && (
                <div className="relative aspect-video bg-muted rounded-md overflow-hidden border">
                  <Image
                      src={capturedImage}
                      alt="Foto de verificación capturada"
                      layout="fill"
                      objectFit="contain"
                      data-ai-hint="person face"
                      className="transform scale-x-[-1]"
                  />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={handleValidationSubmit}
                size="lg"
                aria-label="Validar Datos Biométricos"
                disabled={isSubmitting || !capturedImage}
              >
                {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Validar Datos Biométricos'}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
      
      <AlertDialog open={isWorkAreaAlertOpen} onOpenChange={(open) => { if (!open) onRestart(); }}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
             <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
            <AlertDialogTitle>Ubicación no Autorizada</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center">
            Parece que se encuentra fuera del área de trabajo designada. Por favor, muévase a una ubicación autorizada e intente de nuevo.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isFaceMatchAlertOpen} onOpenChange={(open) => { if (!open) onRestart(); }}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <ShieldAlert className="h-10 w-10 text-red-600 mb-2" />
            <AlertDialogTitle>Verificación Fallida</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center">
            {faceMatchMessage || "El rostro no coincide con el perfil. Intentar suplantar la identidad de otra persona es una ofensa grave y resultará en la terminación inmediata del empleo y posibles acciones legales."}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CompletionScreen;