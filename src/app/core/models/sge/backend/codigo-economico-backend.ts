import { TipoCodigoEconomico } from '../codigo-economico';

export interface ICodigoEconomicoBackend {
  /** ID */
  codigoEconomicoRef: string;
  /** Código */
  codigo: string;
  /** Fecha inicio */
  fechaInicio: string;
  /** Fecha fin */
  fechaFin: string;
  /** Tipo */
  tipo: TipoCodigoEconomico;
}
