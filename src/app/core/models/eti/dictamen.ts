import { TipoEvaluacion } from './tipo-evaluacion';

export interface IDictamen {
  /** Id */
  id: number;

  /** Nombre */
  nombre: string;

  /** Activo */
  activo: boolean;

  /** Tipo evaluacion */
  tipoEvaluacion: TipoEvaluacion;

}
