import { DateTime } from 'luxon';

export interface IConvocatoriaConceptoGastoCodigoEc {
  /** id */
  id: number;
  /** Id de ConvocatoriaConceptoGasto */
  convocatoriaConceptoGastoId: number;
  /** Referencia código económico */
  codigoEconomicoRef: string;
  /** Fecha inicio */
  fechaInicio: DateTime;
  /** Fecha fin */
  fechaFin: DateTime;
  /** Observaciones */
  observaciones: string;
}
