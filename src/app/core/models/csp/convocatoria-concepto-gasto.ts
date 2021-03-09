import { IConvocatoria } from './convocatoria';
import { IConceptoGasto } from './concepto-gasto';

export interface IConvocatoriaConceptoGasto {

  /** id */
  id: number;

  /** ConceptoGasto */
  conceptoGasto: IConceptoGasto;

  /** convocatoria */
  convocatoria: IConvocatoria;

  /** Observaciones */
  observaciones: string;

  /** Importe máximo */
  importeMaximo: number;

  /** Permitido */
  permitido: boolean;

  /** Mes inicial */
  mesInicial: number;

  /** Mes final */
  mesFinal: number;

  /** Porcentaje coste indirecto */
  porcentajeCosteIndirecto: number;
}
