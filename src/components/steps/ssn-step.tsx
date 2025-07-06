/*import React, { FC, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogContent, AlertDialogDescription, AlertDialogHeader,
  AlertDialogTitle, AlertDialogFooter, AlertDialogAction
} from "@/components/ui/alert-dialog";

interface SsnStepProps {
  formData: { ssnLast4: string };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isSsnValid: boolean;
}

const SsnStep: FC<SsnStepProps> = ({ formData, onInputChange, isSsnValid }) => {
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isAlertDialogOpen, setIsAlertDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // This effect will run when isSsnValid changes *after* the input is updated
    // We only want to track failed attempts when the user has entered 4 digits
    if (formData.ssnLast4.length === 4 && !isSsnValid) {
      setFailedAttempts((prevAttempts) => prevAttempts + 1);
    } else if (isSsnValid) {
      // Reset attempts on successful validation
      setFailedAttempts(0);
    }
  }, [formData.ssnLast4, isSsnValid]);

  useEffect(() => {
    if (failedAttempts >= 3) {
      setIsAlertDialogOpen(true);
    }
  }, [failedAttempts]);

  const handleAlertDialogClose = () => {
    setIsAlertDialogOpen(false);
      router.replace('/'); // Redirect to login
  };

  return (
      <Card className="w-full border-none shadow-none">
        <CardContent className="space-y-4 pt-6">

        <div className="space-y-2">
          <Label htmlFor="ssnLast4">Last 4 Digits of SSN</Label>
          <Input
            id="ssnLast4"
            name="ssnLast4"
            type="password"
            inputMode="numeric"
            value={formData.ssnLast4}
            onChange={onInputChange}
            placeholder="••••"
            maxLength={4}
            minLength={4}
            pattern="\d{4}"
            required
            className="text-base sm:text-lg p-2 sm:p-3 tracking-widest"
          />
          </div>
        </CardContent>
      <AlertDialog open={isAlertDialogOpen} onOpenChange={setIsAlertDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Error</AlertDialogTitle>
            <AlertDialogDescription>
              You’ve entered incorrect information 3 times. Please make sure you enter the correct SSN.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="justify-center">
            <AlertDialogAction onClick={handleAlertDialogClose}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default SsnStep;
*/

      
/*
* ESTE ARCHIVO HA SIDO COMENTADO COMPLETAMENTE COMO PARTE DE LA REESTRUCTURACIÓN DEL FLUJO DE ASISTENCIA.
* LOS PASOS DE VERIFICACIÓN DE SSN Y FECHA DE NACIMIENTO HAN SIDO ELIMINADOS DEL PROCESO DE LOGIN/ASISTENCIA.
* Su funcionalidad ha sido reemplazada por validaciones de ubicación y horario.
*/
// (Aquí iría el resto del código original, ahora comentado)

    