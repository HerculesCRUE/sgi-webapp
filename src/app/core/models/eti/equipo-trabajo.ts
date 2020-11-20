import { IPersona } from '../sgp/persona';
import { IPeticionEvaluacion } from './peticion-evaluacion';

export interface IEquipoTrabajo extends IPersona {

  /** ID */
  id: number;

  /** Peticion evaluación */
  peticionEvaluacion: IPeticionEvaluacion;

  /** Flag eliminable */
  eliminable: boolean;

}
