import { DateTime } from 'luxon';

export interface IProyectoPeriodoSeguimiento {
  id: number;
  proyectoId: number;
  numPeriodo: number;
  fechaInicio: DateTime;
  fechaFin: DateTime;
  fechaInicioPresentacion: DateTime;
  fechaFinPresentacion: DateTime;
  observaciones: string;
}
