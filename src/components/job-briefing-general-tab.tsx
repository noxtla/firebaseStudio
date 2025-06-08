import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const JobBriefingGeneralTab = () => {
  return (
    <div className="carousel-slide">
      <h2 className="section-title">Paso 1: Información General</h2>

      <div className="form-grid two-cols">
        <div className="grid-item">
          <Label htmlFor="fecha">FECHA:</Label>
          <Input type="date" id="fecha" name="fecha" required />
        </div>
        <div className="grid-item">
          <Label htmlFor="hora">HORA:</Label>
          <Input type="time" id="hora" name="hora" required />
        </div>
        <div className="grid-item">
          <Label htmlFor="cuadrillaN">CUADRILLA N.°:</Label>
          <Input type="text" id="cuadrillaN" name="cuadrillaN" />
        </div>
        <div className="grid-item">
          <Label htmlFor="capatazNombre">NOMBRE DEL CAPATAZ GENERAL:</Label>
          <Input type="text" id="capatazNombre" name="capatazNombre" required />
        </div>
        <div className="grid-item">
          <Label htmlFor="capatazTelefono">N.° de teléfono:</Label>
          <Input type="tel" id="capatazTelefono" name="capatazTelefono" />
        </div>
      </div>

      <hr />

      <fieldset>
        <legend>UBICACIÓN DEL LUGAR DE TRABAJO</legend>
        <Label htmlFor="ubicacionTrabajo">Dirección de lugar de trabajo:</Label>
        <textarea id="ubicacionTrabajo" name="ubicacionTrabajo" rows="2" required className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"></textarea>
      </fieldset>
    </div>
  );
};

export default JobBriefingGeneralTab;