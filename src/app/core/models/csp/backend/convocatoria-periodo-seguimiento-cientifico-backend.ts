export interface IConvocatoriaPeriodoSeguimientoCientificoBackend {
  id: number;
  numPeriodo: number;
  mesInicial: number;
  mesFinal: number;
  fechaInicioPresentacion: string;
  fechaFinPresentacion: string;
  observaciones: string;
  convocatoriaId: number;
}
