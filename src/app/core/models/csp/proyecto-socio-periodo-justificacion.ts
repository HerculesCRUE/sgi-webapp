import { IProyectoSocio } from './proyecto-socio';

export interface IProyectoSocioPeriodoJustificacion {
  id: number;
  proyectoSocio: IProyectoSocio;
  numPeriodo: number;
  fechaInicio: Date;
  fechaFin: Date;
  fechaInicioPresentacion: Date;
  fechaFinPresentacion: Date;
  observaciones: string;
  documentacionRecibida: boolean;
  fechaRecepcion: Date;
}
