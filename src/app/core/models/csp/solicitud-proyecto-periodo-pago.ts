import { ISolicitudProyectoSocio } from './solicitud-proyecto-socio';

export interface ISolicitudProyectoPeriodoPago {
  id: number;
  solicitudProyectoSocio: ISolicitudProyectoSocio;
  numPeriodo: number;
  importe: number;
  mes: number;
}
