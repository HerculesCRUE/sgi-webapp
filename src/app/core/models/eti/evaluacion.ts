import { IComite } from './comite';
import { IConvocatoriaReunion } from './convocatoria-reunion';
import { IMemoria } from './memoria';
import { IDictamen } from './dictamen';
import { TipoEvaluacion } from './tipo-evaluacion';
import { IEvaluador } from './evaluador';

export interface IEvaluacion {
  /** ID */
  id: number;

  /** Memoria */
  memoria: IMemoria;

  /** Comite */
  comite: IComite;

  /** Convocatoria reunión */
  convocatoriaReunion: IConvocatoriaReunion;

  /** Tipo evaluación */
  tipoEvaluacion: TipoEvaluacion;

  /** Version */
  version: number;

  /** Dictamen */
  dictamen: IDictamen;

  /** Evaluador 1 */
  evaluador1: IEvaluador;

  /** Evaluador 2 */
  evaluador2: IEvaluador;

  /** Fecha Inicio. */
  fechaDictamen: Date;

  /** Es revisión mínima */
  esRevMinima: boolean;

  /** Activo */
  activo: boolean;

  /** Flag eliminable */
  eliminable: boolean;
}
