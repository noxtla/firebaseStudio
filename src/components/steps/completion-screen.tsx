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

const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return utcDate.toLocaleDateString(undefined, options);
  } catch (error) {
    console.error("Error al formatear la fecha:", error);
    return 'Fecha Inválida';
  }
};

const CompletionScreen: FC<CompletionScreenProps> = ({
  capturedImage,
  captureTimestamp,
  capturedLocation,
  userData,
  onRestart
}) => {
  const [submissionState, setSubmissionState] = useState<'reviewing' | 'submitting' | 'submitted'>('reviewing');
  const [submissionResponse, setSubmissionResponse] = useState<string | null>(null);
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [isRestarting, setIsRestarting] = useState(false);

  const [isWorkAreaAlertOpen, setWorkAreaAlertOpen] = useState(false);
  const [isFaceMatchAlertOpen, setFaceMatchAlertOpen] = useState(false);
  const [faceMatchMessage, setFaceMatchMessage] = useState<string>("");
  
  // --- Estados para el nuevo diálogo de éxito ---
  const [isSuccessAlertOpen, setIsSuccessAlertOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleSubmit = async () => {
    setSubmissionState('submitting');
    setSubmissionResponse(null);

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

      // --- Lógica de éxito actualizada ---
      const result = await response.json();
      setSubmissionState('submitted'); // Muestra la pantalla de éxito en el fondo

      if (Array.isArray(result) && result.length > 0 && result[0].recognizedName) {
        const name = result[0].recognizedName;
        setSuccessMessage(`Asistencia registrada: ${name}`);
        setIsSuccessAlertOpen(true); // Abre el diálogo de éxito personalizado
      } else {
        // Si la respuesta es exitosa pero no tiene el formato esperado, muestra un toast genérico
        toast({
          variant: "success",
          title: "Asistencia Registrada",
          description: "Su asistencia ha sido registrada exitosamente.",
        });
        setSubmissionResponse(JSON.stringify(result));
      }
    } catch (error: any) {
      console.error("Error de envío:", error);
      setSubmissionResponse(`El envío falló: ${error.message}`);
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

  const handleActualRestart = async () => {
    setIsRestarting(true);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('currentTruckNumber');
    }
    onRestart();
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
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <CardTitle className="text-xl sm:text-2xl text-center">¡Asistencia Registrada!</CardTitle>
              <CardDescription className="text-center text-base px-2">
                Esperamos que tenga un día exitoso y seguro. Gracias por trabajar para Tree Services.
              </CardDescription>
            </CardHeader>
            {submissionResponse && (
              <CardContent className="pt-4">
                <div className="mt-4 p-3 bg-muted rounded-md w-full overflow-x-auto">
                  <h4 className="text-sm font-semibold mb-1 text-muted-foreground">Respuesta del Servidor:</h4>
                  <pre className="text-xs whitespace-pre-wrap break-all bg-background p-2 rounded border text-foreground">
                    {submissionResponse}
                  </pre>
                </div>
              </CardContent>
            )}
            {/* El botón de finalizar solo se muestra si el diálogo de éxito no está activo */}
            {!isSuccessAlertOpen && (
              <CardFooter className="flex justify-center pt-6">
                <Button onClick={handleActualRestart} size="lg" aria-label="Finalizar" disabled={isRestarting}>
                  {isRestarting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isRestarting ? "Cargando..." : "Finalizar"}
                </Button>
              </CardFooter>
            )}
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

      {/* --- Nuevo Diálogo de Éxito --- */}
      <AlertDialog open={isSuccessAlertOpen} onOpenChange={setIsSuccessAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader className="items-center">
            <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
            <AlertDialogTitle>¡Éxito!</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription className="text-center">
            {successMessage}
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