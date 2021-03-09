import { IConvocatoriaConceptoGasto } from './convocatoria-concepto-gasto';

export interface IConvocatoriaConceptoGastoCodigoEc {

  /** id */
  id: number;

  /** ConceptoGasto */
  convocatoriaConceptoGasto: IConvocatoriaConceptoGasto;

  /** Referencia código económico */
  codigoEconomicoRef: string;

  /** Fecha inicio */
  fechaInicio: Date;

  /** Fecha fin */
  fechaFin: Date;

  /** Observaciones */
  observaciones: string;
}
