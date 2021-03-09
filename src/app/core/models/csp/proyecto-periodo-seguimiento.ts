import { IProyecto } from './proyecto';

export interface IProyectoPeriodoSeguimiento {
  id: number;
  proyecto: IProyecto;
  numPeriodo: number;
  fechaInicio: Date;
  fechaFin: Date;
  fechaInicioPresentacion: Date;
  fechaFinPresentacion: Date;
  observaciones: string;
}