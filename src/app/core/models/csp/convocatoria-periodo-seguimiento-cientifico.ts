import { DateTime } from 'luxon';

export interface IConvocatoriaPeriodoSeguimientoCientifico {
  id: number;
  numPeriodo: number;
  mesInicial: number;
  mesFinal: number;
  fechaInicioPresentacion: DateTime;
  fechaFinPresentacion: DateTime;
  observaciones: string;
  convocatoriaId: number;
}
