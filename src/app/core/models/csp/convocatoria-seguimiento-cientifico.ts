import { IConvocatoria } from './convocatoria';

export interface IConvocatoriaSeguimientoCientifico {
  id: number;
  numPeriodo: number;
  mesInicial: number;
  mesFinal: number;
  fechaInicioPresentacion: Date;
  fechaFinPresentacion: Date;
  observaciones: string;
  convocatoria: IConvocatoria;
}
