import { DateTime } from 'luxon';

export enum TipoCodigoEconomico {
  INGRESO = 'Ingreso',
  GASTO = 'Gasto'
}

export interface ICodigoEconomico {
  /** ID */
  codigoEconomicoRef: string;
  /** Código */
  codigo: string;
  /** Fecha inicio */
  fechaInicio: DateTime;
  /** Fecha fin */
  fechaFin: DateTime;
  /** Tipo */
  tipo: TipoCodigoEconomico;
}
