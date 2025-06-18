import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Loader2, MapPin, ShieldAlert, AlertTriangle } from 'lucide-react';
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
}

const CompletionScreen: FC<CompletionScreenProps> = ({
  capturedImage,
  captureTimestamp,
  capturedLocation,
  userData,
  onRestart
}) => {
  const [submissionState, setSubmissionState] = useState<'reviewing' | 'submitting' | 'submitted'>('reviewing');
  const [recognizedName, setRecognizedName] = useState<string | null>(null);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const [isWorkAreaAlertOpen, setWorkAreaAlertOpen] = useState(false);
  const [isFaceMatchAlertOpen, setFaceMatchAlertOpen] = useState(false);
  const [faceMatchMessage, setFaceMatchMessage] = useState<string>("");
  
  const [isSuccessAlertOpen, setIsSuccessAlertOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Botón "Enviar" en la pantalla de revisión
  const handleSubmit = async () => {
    setSubmissionState('submitting');

    if (!capturedImage || !userData) {
      toast({
        variant: "destructive",
        title: "Error de Envío",
        description: "Faltan datos de imagen o de usuario. Por favor, reinicie el proceso.",
      });
      setSubmissionState('reviewing');
      return;
    }

    try {
      // Envía la imagen para validación inicial
      const response = await fetch(WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          capturedImage,
          captureTimestamp,
          capturedLocation,
          userData,
          action: "capturedImage", // Esta acción valida la imagen
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (Array.isArray(errorData) && errorData.length > 0 && errorData[0].response?.body?.Failed === "Face does not match profile") {
            const personName = errorData[0].response.body["Person is"];
            setFaceMatchMessage(`El rostro no coincide con el perfil. El sistema lo ha identificado como: ${personName}`);
            setFaceMatchAlertOpen(true);
            setSubmissionState('reviewing');
            return;
        }
        if (errorData.Error === "User is outside of the designated work area") {
            setWorkAreaAlertOpen(true);
            setSubmissionState('reviewing');
            return;
        }
        throw new Error(`Error HTTP! status: ${response.status}`);
      }

      const result = await response.json();
      setSubmissionState('submitted');

      if (Array.isArray(result) && result.length > 0 && result[0].recognizedName) {
        const name = result[0].recognizedName;
        setRecognizedName(name);
        setSuccessMessage(`¡Bienvenido, ${name}!`);
        setIsSuccessAlertOpen(true);
      } else {
        toast({
          variant: "success",
          title: "Asistencia Registrada",
          description: "Su asistencia ha sido registrada exitosamente.",
        });
      }
    } catch (error: any) {
      console.error("Error de envío:", error);
      setSubmissionState('reviewing');
      toast({
        variant: "destructive",
        title: "Error de Envío",
        description: "Falló el registro de asistencia. Por favor, inténtelo de nuevo.",
      });
    }

    if (typeof window !== 'undefined') {
      sessionStorage.setItem('attendanceSubmitted', 'true');
    }
  };

  // Botón "Finalizar" en la pantalla de éxito
  const handleActualRestart = async () => {
    if(isRestarting) return;
    setIsRestarting(true);
    
    try {
      console.log("Enviando webhook con action: 'finalAte'...");
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'finalAte', // ACCIÓN CAMBIADA A 'finalAte'
          capturedImage,
          captureTimestamp,
          capturedLocation,
          userData,
        }),
      });

      if (!response.ok) {
        console.error('Fallo al enviar el webhook de finalización', await response.text());
        toast({
          title: "Advertencia",
          description: "No se pudo notificar al servidor la finalización, pero su asistencia fue guardada.",
          variant: "destructive",
        });
      } else {
        console.log("Webhook de finalización enviado con éxito.");
      }
    } catch (error) {
      console.error('Error al enviar el webhook de finalización:', error);
      toast({
        title: "Error de Red",
        description: "No se pudo conectar con el servidor para finalizar.",
        variant: "destructive",
      });
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('currentTruckNumber');
      }
      onRestart();
    }
  };

  if (!userData) {
    return <p className="text-destructive text-center p-4">Error: Faltan los datos del usuario para mostrar el resumen.</p>;
  }

  return (
    <>
      <Card className="w-full border-none shadow-none">
        {submissionState === 'submitted' ? (
          <>
            <CardHeader className="items-center pt-6 animate-step-enter">
              <CheckCircle className="w-20 h-20 text-green-500 mb-4 animate-soft-pulse" />
              <CardTitle className="text-2xl sm:text-3xl text-center font-bold text-foreground">
                {recognizedName ? `¡Bienvenido, ${recognizedName}!` : '¡Asistencia Registrada!'}
              </CardTitle>
              <CardDescription className="text-center text-lg px-2 mt-2 text-muted-foreground">
                Que tengas un excelente y seguro día de trabajo.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex justify-center pt-8">
              <Button onClick={handleActualRestart} size="lg" aria-label="Finalizar" disabled={isRestarting}>
                {isRestarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isRestarting ? "Finalizando..." : "Finalizar"}
              </Button>
            </CardFooter>
          </>
        ) : (
          <>
            <CardHeader className="items-center pt-6">
              <CardTitle
                className={cn(
                  "text-xl sm:text-2xl text-center font-heading-style",
                  isMounted && submissionState === 'reviewing' && "animate-title-pulse"
                )}
              >
                {submissionState === 'submitting' ? 'Procesando...' : 'Enviar su Información'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div>
                <h3 className="font-semibold text-lg mb-2">Resumen:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground list-disc list-inside">
                  <li>Nombre: {userData.Name}</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Detalles de Captura:</h3>
                {captureTimestamp && (
                  <p className="text-sm text-muted-foreground">Foto capturada el: {new Date(captureTimestamp).toLocaleString()}</p>
                )}
                {capturedLocation ? (
                  <p className="text-sm text-muted-foreground flex items-center">
                    <MapPin className="h-4 w-4 mr-1 text-primary" />
                    Ubicación Capturada
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">Datos de ubicación: No disponibles o permiso denegado.</p>
                )}
              </div>
              {capturedImage && (
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg">Foto Capturada:</h3>
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
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                onClick={handleSubmit}
                size="lg"
                aria-label="Enviar información"
                disabled={submissionState === 'submitting' || !capturedImage}
                className={cn(
                  "bg-green-600 hover:bg-green-700 text-white focus-visible:ring-green-500",
                )}
              >
                {submissionState === 'submitting' ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Por favor espere, validando datos...
                  </>
                ) : (
                  'Enviar'
                )}
              </Button>
            </CardFooter>
          </>
        )}
      </Card>

      <AlertDialog open={isWorkAreaAlertOpen} onOpenChange={setWorkAreaAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
             <AlertTriangle className="h-10 w-10 text-yellow-500 mb-2" />
            <AlertDialogTitle>Ubicación no Autorizada</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center">
            Parece que se encuentra fuera del área de trabajo designada. Por favor, muévase a una ubicación autorizada e intente de nuevo.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setWorkAreaAlertOpen(false); onRestart(); }}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isFaceMatchAlertOpen} onOpenChange={setFaceMatchAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <ShieldAlert className="h-10 w-10 text-red-600 mb-2" />
            <AlertDialogTitle>Verificación Fallida</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center">
            {faceMatchMessage || "El rostro no coincide con el perfil. Intentar suplantar la identidad de otra persona es una ofensa grave y resultará en la terminación inmediata del empleo y posibles acciones legales."}
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setFaceMatchAlertOpen(false); onRestart(); }}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isSuccessAlertOpen} onOpenChange={setIsSuccessAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
            <AlertDialogTitle>{successMessage}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center">
            Tu asistencia ha sido registrada exitosamente.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => { setIsSuccessAlertOpen(false); handleActualRestart(); }}>Finalizar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default CompletionScreen;