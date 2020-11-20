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

  /** Número de meses */
  numMeses: number;

  /** Porcentaje coste indirecto */
  porcentajeCosteIndirecto: number;

  /** Indica si se puede realizar o no cualquier acción */
  enableAccion: boolean;

}
