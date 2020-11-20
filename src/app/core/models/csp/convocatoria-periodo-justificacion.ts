import { IConvocatoria } from './convocatoria';

export enum TipoJustificacion {
  PERIODICA = 'periodica',
  FINAL = 'final'
}

export interface IConvocatoriaPeriodoJustificacion {
  /** Id */
  id: number;

  /** Convocatoria */
  convocatoria: IConvocatoria;

  /** Num Periodo */
  numPeriodo: number;

  /** Mes inicial */
  mesInicial: number;

  /** Mes final */
  mesFinal: number;

  /** Fecha inicio */
  fechaInicioPresentacion: Date;

  /** Fecha fin */
  fechaFinPresentacion: Date;

  /** Observaciones */
  observaciones: string;

  /** Tipo */
  tipoJustificacion: TipoJustificacion;

}
