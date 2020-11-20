
import { IPeticionEvaluacion } from './peticion-evaluacion';
import { IComite } from './comite';
import { TipoMemoria } from './tipo-memoria';
import { TipoEstadoMemoria } from './tipo-estado-memoria';
import { IRetrospectiva } from './retrospectiva';

export interface IMemoria {
  /** Id */
  id: number;

  numReferencia: string;

  /** Petición evaluación */
  peticionEvaluacion: IPeticionEvaluacion;

  /** Comité */
  comite: IComite;

  /** Título */
  titulo: string;

  /** Referencia persona */
  personaRef: string;

  /** Tipo Memoria */
  tipoMemoria: TipoMemoria;

  /** Fecha envio secretaria. */
  fechaEnvioSecretaria: Date;

  /** Indicador require retrospectiva */
  requiereRetrospectiva: boolean;

  /** Version */
  version: number;

  /** Estado Memoria Actual */
  estadoActual: TipoEstadoMemoria;

  /** Responsable de memoria */
  isResponsable: boolean;

  /** Retrospectiva */
  retrospectiva: IRetrospectiva;

  /** Código organo */
  codOrganoCompetente: string;

  /** Memoria original */
  memoriaOriginal: IMemoria;
}
