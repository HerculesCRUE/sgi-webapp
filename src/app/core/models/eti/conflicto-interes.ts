import { IPersona } from '../sgp/persona';
import { IEvaluador } from './evaluador';

export interface IConflictoInteres extends IPersona {

  /** Id */
  id: number;

  /** Evaluador */
  evaluador: IEvaluador;

  /** Referencia persona conflicto */
  personaConflictoRef: string;

}
