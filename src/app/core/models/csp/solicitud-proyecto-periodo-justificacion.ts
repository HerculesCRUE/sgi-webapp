import { ISolicitudProyectoSocio } from './solicitud-proyecto-socio';

export interface ISolicitudProyectoPeriodoJustificacion {
  id: number;
  solicitudProyectoSocio: ISolicitudProyectoSocio;
  numPeriodo: number;
  mesInicial: number;
  mesFinal: number;
  fechaInicio: Date;
  fechaFin: Date;
  observaciones: string;
}
