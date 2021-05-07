import { DateTime } from 'luxon';
import { IPersona } from '../sgp/persona';
import { IComite } from './comite';
import { IPeticionEvaluacion } from './peticion-evaluacion';
import { IRetrospectiva } from './retrospectiva';
import { ESTADO_MEMORIA, TipoEstadoMemoria } from './tipo-estado-memoria';
import { TipoMemoria } from './tipo-memoria';

export function isFormularioEditable(memoria: IMemoria) {
  if (!memoria.estadoActual.id) {
    return true;
  }
  const estado = memoria.estadoActual.id as ESTADO_MEMORIA;
  switch (+estado) {
    case ESTADO_MEMORIA.COMPLETADA:
    case ESTADO_MEMORIA.COMPLETADA_SEGUIMIENTO_ANUAL:
    case ESTADO_MEMORIA.COMPLETADA_SEGUIMIENTO_FINAL:
    case ESTADO_MEMORIA.EN_ELABORACION:
    case ESTADO_MEMORIA.FAVORABLE_PENDIENTE_MODIFICACIONES_MINIMAS:
    case ESTADO_MEMORIA.PENDIENTE_CORRECCIONES:
      return true;
    default:
      return false;
  }
}

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
  /** Responsable */
  responsable: IPersona;
  /** Tipo Memoria */
  tipoMemoria: TipoMemoria;
  /** Fecha envio secretaria. */
  fechaEnvioSecretaria: DateTime;
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
  /** Activo */
  activo: boolean;
}
