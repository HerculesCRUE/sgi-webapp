export interface IProyectoPeriodoSeguimientoBackend {
  id: number;
  proyectoId: number;
  numPeriodo: number;
  fechaInicio: string;
  fechaFin: string;
  fechaInicioPresentacion: string;
  fechaFinPresentacion: string;
  observaciones: string;
}
